import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Logo } from '@/components/Logo';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet, 
  Lock, 
  CheckCircle2,
  ArrowLeft,
  Loader2
} from 'lucide-react';

export default function Payment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const bookingId = searchParams.get('bookingId');
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  
  // Form states
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  useEffect(() => {
    if (!bookingId) {
      navigate('/dashboard');
      return;
    }
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          from_station:railway_stations!bookings_from_station_id_fkey(station_name, station_code),
          to_station:railway_stations!bookings_to_station_id_fkey(station_name, station_code),
          commodity:commodity_categories(name)
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      setBooking(data);
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast({
        title: "Error",
        description: "Failed to load booking details",
        variant: "destructive"
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    try {
      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          booking_id: bookingId,
          amount: booking.total_amount,
          payment_method: paymentMethod,
          payment_status: 'completed',
          transaction_id: `TXN${Date.now()}`,
          payment_date: new Date().toISOString()
        });

      if (paymentError) throw paymentError;

      // Update booking status
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);

      if (bookingError) throw bookingError;

      // Create notification
      const { error: notificationError } = await supabase.rpc('create_notification', {
        p_user_id: booking.user_id,
        p_title: 'Payment Successful',
        p_message: `Payment of ₹${booking.total_amount} received for booking ${booking.booking_number}`,
        p_type: 'payment',
        p_booking_id: bookingId
      });

      if (notificationError) console.error('Notification error:', notificationError);

      setPaymentSuccess(true);
      
      toast({
        title: "Payment Successful!",
        description: "Your booking has been confirmed.",
      });

      setTimeout(() => {
        navigate('/my-bookings');
      }, 3000);
      
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <CheckCircle2 className="h-24 w-24 text-green-500 mx-auto mb-6" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground mb-4">Your booking has been confirmed</p>
          <p className="text-sm text-muted-foreground">Redirecting to your bookings...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <motion.header 
        className="bg-card/50 backdrop-blur-lg shadow-sm border-b"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid lg:grid-cols-3 gap-6"
        >
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Secure Payment
                </CardTitle>
                <CardDescription>
                  Choose your preferred payment method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
                  <TabsList className="grid grid-cols-4 mb-6">
                    <TabsTrigger value="upi" className="flex flex-col gap-1 h-auto py-3">
                      <Smartphone className="h-5 w-5" />
                      <span className="text-xs">UPI</span>
                    </TabsTrigger>
                    <TabsTrigger value="card" className="flex flex-col gap-1 h-auto py-3">
                      <CreditCard className="h-5 w-5" />
                      <span className="text-xs">Card</span>
                    </TabsTrigger>
                    <TabsTrigger value="netbanking" className="flex flex-col gap-1 h-auto py-3">
                      <Building2 className="h-5 w-5" />
                      <span className="text-xs">Net Banking</span>
                    </TabsTrigger>
                    <TabsTrigger value="wallet" className="flex flex-col gap-1 h-auto py-3">
                      <Wallet className="h-5 w-5" />
                      <span className="text-xs">Wallet</span>
                    </TabsTrigger>
                  </TabsList>

                  <AnimatePresence mode="wait">
                    <TabsContent value="upi" className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="upi">UPI ID</Label>
                            <Input
                              id="upi"
                              placeholder="yourname@upi"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              className="mt-2"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" className="flex-1">Google Pay</Button>
                            <Button variant="outline" className="flex-1">PhonePe</Button>
                            <Button variant="outline" className="flex-1">Paytm</Button>
                          </div>
                        </div>
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="card" className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            maxLength={19}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cardName">Cardholder Name</Label>
                          <Input
                            id="cardName"
                            placeholder="JOHN DOE"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input
                              id="expiry"
                              placeholder="MM/YY"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              maxLength={5}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="cvv">CVV</Label>
                            <Input
                              id="cvv"
                              placeholder="123"
                              type="password"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              maxLength={3}
                              className="mt-2"
                            />
                          </div>
                        </div>
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="netbanking" className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <RadioGroup defaultValue="sbi">
                          <div className="space-y-2">
                            {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank'].map((bank) => (
                              <div key={bank} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 smooth-transition">
                                <RadioGroupItem value={bank.toLowerCase().replace(/\s+/g, '')} id={bank} />
                                <Label htmlFor={bank} className="flex-1 cursor-pointer">{bank}</Label>
                              </div>
                            ))}
                          </div>
                        </RadioGroup>
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="wallet" className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <RadioGroup defaultValue="paytm">
                          <div className="space-y-2">
                            {['Paytm Wallet', 'PhonePe Wallet', 'Amazon Pay', 'Mobikwik', 'Freecharge'].map((wallet) => (
                              <div key={wallet} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 smooth-transition">
                                <RadioGroupItem value={wallet.toLowerCase().replace(/\s+/g, '')} id={wallet} />
                                <Label htmlFor={wallet} className="flex-1 cursor-pointer">{wallet}</Label>
                              </div>
                            ))}
                          </div>
                        </RadioGroup>
                      </motion.div>
                    </TabsContent>
                  </AnimatePresence>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="hover-lift sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Booking #{booking?.booking_number}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">From</span>
                    <span className="font-medium">{booking?.from_station?.station_code}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">To</span>
                    <span className="font-medium">{booking?.to_station?.station_code}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Commodity</span>
                    <span className="font-medium">{booking?.commodity?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Weight</span>
                    <span className="font-medium">{booking?.weight_kg} kg</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base Charge</span>
                    <span>₹{booking?.base_charge?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax & GST</span>
                    <span>₹{booking?.tax_amount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total Amount</span>
                    <span className="text-primary">₹{booking?.total_amount?.toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  className="w-full h-12 text-lg hover-lift" 
                  onClick={handlePayment}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-5 w-5" />
                      Pay ₹{booking?.total_amount?.toFixed(2)}
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  <span>Secured by 256-bit SSL encryption</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
