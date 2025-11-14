-- Add cancellation fields to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS cancellation_reason text,
ADD COLUMN IF NOT EXISTS refund_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_status text DEFAULT 'not_applicable' CHECK (refund_status IN ('not_applicable', 'pending', 'processed', 'rejected'));

-- Create cargo availability table to track available slots
CREATE TABLE IF NOT EXISTS public.cargo_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_station_id uuid NOT NULL,
  to_station_id uuid NOT NULL,
  available_date date NOT NULL,
  commodity_category_id uuid NOT NULL,
  total_capacity_kg numeric NOT NULL DEFAULT 10000,
  booked_capacity_kg numeric NOT NULL DEFAULT 0,
  available_capacity_kg numeric GENERATED ALWAYS AS (total_capacity_kg - booked_capacity_kg) STORED,
  price_per_kg numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(from_station_id, to_station_id, available_date, commodity_category_id)
);

-- Enable RLS
ALTER TABLE public.cargo_availability ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view availability
CREATE POLICY "Anyone can view cargo availability"
ON public.cargo_availability
FOR SELECT
USING (true);

-- Only admins can manage availability
CREATE POLICY "Admins can manage cargo availability"
ON public.cargo_availability
FOR ALL
USING (has_role(auth.uid(), 'admin'::user_role));

-- Create trigger for updated_at
CREATE TRIGGER update_cargo_availability_updated_at
BEFORE UPDATE ON public.cargo_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check cancellation eligibility (24 hours before booking)
CREATE OR REPLACE FUNCTION public.can_cancel_booking(booking_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  booking_date timestamp with time zone;
BEGIN
  SELECT created_at INTO booking_date
  FROM public.bookings
  WHERE id = booking_id;
  
  -- Can cancel if booking is less than 24 hours old
  RETURN (NOW() - booking_date) < INTERVAL '24 hours';
END;
$$;

-- Function to process booking cancellation with refund
CREATE OR REPLACE FUNCTION public.cancel_booking_with_refund(
  p_booking_id uuid,
  p_cancellation_reason text,
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking record;
  v_refund_amount numeric;
  v_can_cancel boolean;
BEGIN
  -- Get booking details
  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id AND user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Booking not found or unauthorized'
    );
  END IF;
  
  IF v_booking.status = 'cancelled' THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Booking is already cancelled'
    );
  END IF;
  
  IF v_booking.status = 'delivered' THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Cannot cancel delivered booking'
    );
  END IF;
  
  -- Check if cancellation is within time limit
  SELECT can_cancel_booking(p_booking_id) INTO v_can_cancel;
  
  IF NOT v_can_cancel THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Cancellation not allowed - 24 hour time limit exceeded'
    );
  END IF;
  
  -- Calculate refund (100% if within 24 hours)
  v_refund_amount := v_booking.total_amount;
  
  -- Update booking
  UPDATE public.bookings
  SET 
    status = 'cancelled',
    cancelled_at = NOW(),
    cancellation_reason = p_cancellation_reason,
    refund_amount = v_refund_amount,
    refund_status = 'pending',
    updated_at = NOW()
  WHERE id = p_booking_id;
  
  -- Create notification
  PERFORM create_notification(
    p_user_id,
    'Booking Cancelled',
    'Your booking ' || v_booking.booking_number || ' has been cancelled. Refund of ₹' || v_refund_amount || ' will be processed within 5-7 business days.',
    'cancellation',
    p_booking_id
  );
  
  -- Add tracking update
  INSERT INTO public.tracking_updates (booking_id, status, description, updated_by)
  VALUES (
    p_booking_id,
    'cancelled',
    'Booking cancelled by user. Reason: ' || p_cancellation_reason,
    p_user_id
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Booking cancelled successfully',
    'refund_amount', v_refund_amount
  );
END;
$$;