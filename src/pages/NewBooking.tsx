import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Package, Loader2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface Station {
  id: string;
  station_name: string;
  station_code: string;
  city: string;
}

interface Category {
  id: string;
  name: string;
  base_rate_per_kg: number;
}

interface AvailabilitySlot {
  id: string;
  from_station_id: string;
  to_station_id: string;
  commodity_category_id: string;
  available_capacity_kg: number;
  price_per_kg: number;
  total_capacity_kg: number;
  booked_capacity_kg: number;
}

export default function NewBooking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);

  const [formData, setFormData] = useState({
    senderName: '',
    senderPhone: '',
    senderAddress: '',
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    fromStationId: '',
    toStationId: '',
    categoryId: '',
    weight: '',
    declaredValue: '',
    description: '',
  });

  useEffect(() => {
    fetchStationsAndCategories();
  }, []);

  const fetchStationsAndCategories = async () => {
    const { data: stationsData } = await supabase
      .from('railway_stations')
      .select('*')
      .eq('is_active', true)
      .order('station_name');

    const { data: categoriesData } = await supabase
      .from('commodity_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (stationsData) setStations(stationsData);
    if (categoriesData) setCategories(categoriesData);
  };

  const calculateCharges = () => {
    const category = categories.find(c => c.id === formData.categoryId);
    if (!category || !formData.weight) return { base: 0, tax: 0, total: 0 };

    const weight = parseFloat(formData.weight);
    const baseCharge = category.base_rate_per_kg * weight;
    const taxAmount = baseCharge * 0.18; // 18% GST
    const totalAmount = baseCharge + taxAmount;

    return {
      base: baseCharge,
      tax: taxAmount,
      total: totalAmount,
    };
  };

  const checkAvailability = async () => {
    if (!formData.fromStationId || !formData.toStationId || !formData.categoryId) {
      toast({
        title: "Missing Information",
        description: "Please select origin, destination, and commodity category first.",
        variant: "destructive",
      });
      return;
    }

    setCheckingAvailability(true);
    try {
      const { data, error } = await supabase
        .from('cargo_availability')
        .select('*')
        .eq('from_station_id', formData.fromStationId)
        .eq('to_station_id', formData.toStationId)
        .eq('commodity_category_id', formData.categoryId)
        .gte('available_capacity_kg', 0);

      if (error) throw error;

      setAvailabilitySlots(data || []);
      
      if (!data || data.length === 0) {
        toast({
          title: "No Availability",
          description: "No cargo slots available for this route and commodity type.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      toast({
        title: "Error",
        description: "Failed to check availability. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // First, check if there's available capacity for this route
      const weight = parseFloat(formData.weight);
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('cargo_availability')
        .select('*')
        .eq('from_station_id', formData.fromStationId)
        .eq('to_station_id', formData.toStationId)
        .eq('commodity_category_id', formData.categoryId)
        .gte('available_capacity_kg', weight)
        .limit(1)
        .maybeSingle();

      if (availabilityError) {
        console.error('Error checking availability:', availabilityError);
      }

      if (!availabilityData) {
        toast({
          title: "No Slots Available",
          description: `There are no cargo slots available for this route with sufficient capacity (${weight} kg required). Please check availability or try a different route.`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const charges = calculateCharges();
      const bookingNumber = await supabase.rpc('generate_booking_number');

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          booking_number: bookingNumber.data,
          sender_name: formData.senderName,
          sender_phone: formData.senderPhone,
          sender_address: formData.senderAddress,
          receiver_name: formData.receiverName,
          receiver_phone: formData.receiverPhone,
          receiver_address: formData.receiverAddress,
          from_station_id: formData.fromStationId,
          to_station_id: formData.toStationId,
          commodity_category_id: formData.categoryId,
          weight_kg: weight,
          declared_value: parseFloat(formData.declaredValue),
          description: formData.description,
          base_charge: charges.base,
          tax_amount: charges.tax,
          total_amount: charges.total,
          status: 'pending',
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create initial tracking update
      await supabase.from('tracking_updates').insert({
        booking_id: booking.id,
        status: 'pending',
        location: formData.fromStationId,
        description: 'Booking created and awaiting confirmation',
        updated_by: user.id,
      });

      // Create notification
      await supabase.rpc('create_notification', {
        p_user_id: user.id,
        p_title: 'Booking Created',
        p_message: `Your booking ${bookingNumber.data} has been created successfully.`,
        p_type: 'booking',
        p_booking_id: booking.id,
      });

      toast({
        title: 'Booking Created',
        description: `Your booking number is ${bookingNumber.data}. Proceeding to payment...`,
      });

      navigate(`/payment?bookingId=${booking.id}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const charges = calculateCharges();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">New Booking</h1>
              <p className="text-sm text-muted-foreground">Create a new parcel booking</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sender Details */}
          <Card>
            <CardHeader>
              <CardTitle>Sender Details</CardTitle>
              <CardDescription>Information about the sender</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senderName">Full Name *</Label>
                <Input
                  id="senderName"
                  required
                  value={formData.senderName}
                  onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderPhone">Phone Number *</Label>
                <Input
                  id="senderPhone"
                  required
                  type="tel"
                  value={formData.senderPhone}
                  onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="senderAddress">Address *</Label>
                <Textarea
                  id="senderAddress"
                  required
                  value={formData.senderAddress}
                  onChange={(e) => setFormData({ ...formData, senderAddress: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Receiver Details */}
          <Card>
            <CardHeader>
              <CardTitle>Receiver Details</CardTitle>
              <CardDescription>Information about the receiver</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="receiverName">Full Name *</Label>
                <Input
                  id="receiverName"
                  required
                  value={formData.receiverName}
                  onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiverPhone">Phone Number *</Label>
                <Input
                  id="receiverPhone"
                  required
                  type="tel"
                  value={formData.receiverPhone}
                  onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="receiverAddress">Address *</Label>
                <Textarea
                  id="receiverAddress"
                  required
                  value={formData.receiverAddress}
                  onChange={(e) => setFormData({ ...formData, receiverAddress: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Route & Parcel Details */}
          <Card>
            <CardHeader>
              <CardTitle>Route & Parcel Details</CardTitle>
              <CardDescription>Journey and package information</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromStation">From Station *</Label>
                <Select
                  required
                  value={formData.fromStationId}
                  onValueChange={(value) => setFormData({ ...formData, fromStationId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select station" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map((station) => (
                      <SelectItem key={station.id} value={station.id}>
                        {station.station_name} ({station.station_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="toStation">To Station *</Label>
                <Select
                  required
                  value={formData.toStationId}
                  onValueChange={(value) => setFormData({ ...formData, toStationId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select station" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map((station) => (
                      <SelectItem key={station.id} value={station.id}>
                        {station.station_name} ({station.station_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Commodity Category *</Label>
                <Select
                  required
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name} (₹{category.base_rate_per_kg}/kg)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg) *</Label>
                <Input
                  id="weight"
                  required
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="declaredValue">Declared Value (₹) *</Label>
                <Input
                  id="declaredValue"
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.declaredValue}
                  onChange={(e) => setFormData({ ...formData, declaredValue: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the parcel contents"
                />
              </div>
            </CardContent>
          </Card>

          {/* Check Availability Section */}
          <Card>
            <CardHeader>
              <CardTitle>Check Slot Availability</CardTitle>
              <CardDescription>
                Verify available cargo capacity for your selected route
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={checkAvailability}
                    disabled={!formData.fromStationId || !formData.toStationId || !formData.categoryId}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    {checkingAvailability ? "Checking..." : "Check Availability"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Available Cargo Slots</DialogTitle>
                    <DialogDescription>
                      View available capacity for your selected route and commodity type
                    </DialogDescription>
                  </DialogHeader>
                  
                  {checkingAvailability ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : availabilitySlots.length > 0 ? (
                    <div className="space-y-4">
                      {availabilitySlots.map((slot) => {
                        const fromStation = stations.find(s => s.id === slot.from_station_id);
                        const toStation = stations.find(s => s.id === slot.to_station_id);
                        const category = categories.find(c => c.id === slot.commodity_category_id);
                        const utilizationPercent = ((slot.booked_capacity_kg / slot.total_capacity_kg) * 100).toFixed(1);
                        
                        return (
                          <Card key={slot.id}>
                            <CardContent className="pt-6">
                              <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-semibold">
                                      {fromStation?.station_code} → {toStation?.station_code}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {category?.name}
                                    </p>
                                  </div>
                                  <Badge variant={slot.available_capacity_kg > 1000 ? "default" : "secondary"}>
                                    {slot.available_capacity_kg.toFixed(0)} kg available
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Total Capacity</p>
                                    <p className="font-medium">{slot.total_capacity_kg.toFixed(0)} kg</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Utilization</p>
                                    <p className="font-medium">{utilizationPercent}%</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Price per kg</p>
                                    <p className="font-medium">₹{slot.price_per_kg.toFixed(2)}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Est. Total (incl. GST)</p>
                                    <p className="font-medium">
                                      ₹{formData.weight ? (slot.price_per_kg * parseFloat(formData.weight) * 1.18).toFixed(2) : '0.00'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Select route and commodity details to check availability
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Price Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Price Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Charge:</span>
                <span className="font-medium">₹{charges.base.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST (18%):</span>
                <span className="font-medium">₹{charges.tax.toFixed(2)}</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total Amount:</span>
                <span className="font-bold text-primary">₹{charges.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Package className="mr-2 h-4 w-4" />
                  Create Booking
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
