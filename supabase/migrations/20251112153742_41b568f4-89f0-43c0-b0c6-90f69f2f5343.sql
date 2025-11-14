-- Fix cancel_booking_with_refund function to use valid notification type
CREATE OR REPLACE FUNCTION public.cancel_booking_with_refund(p_booking_id uuid, p_cancellation_reason text, p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  
  -- Create notification with valid type 'system'
  PERFORM create_notification(
    p_user_id,
    'Booking Cancelled',
    'Your booking ' || v_booking.booking_number || ' has been cancelled. Refund of ₹' || v_refund_amount || ' will be processed within 5-7 business days.',
    'system',
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
$function$;