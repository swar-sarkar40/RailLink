import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Package, MapPin, Clock, Loader2, Search } from 'lucide-react';
import { format } from 'date-fns';

interface Booking {
  id: string;
  booking_number: string;
  sender_name: string;
  receiver_name: string;
  status: string;
  booking_date: string;
  expected_delivery_date: string | null;
  from_station: { station_name: string; station_code: string };
  to_station: { station_name: string; station_code: string };
}

interface TrackingUpdate {
  id: string;
  status: string;
  location: string | null;
  description: string;
  created_at: string;
}

export default function TrackBooking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('id');
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [trackingUpdates, setTrackingUpdates] = useState<TrackingUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchNumber, setSearchNumber] = useState('');

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails(bookingId);
    } else {
      setLoading(false);
    }
  }, [bookingId]);

  const fetchBookingDetails = async (id: string) => {
    try {
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          from_station:railway_stations!bookings_from_station_id_fkey(station_name, station_code),
          to_station:railway_stations!bookings_to_station_id_fkey(station_name, station_code)
        `)
        .eq('id', id)
        .single();

      if (bookingError) throw bookingError;
      setBooking(bookingData);

      const { data: trackingData, error: trackingError } = await supabase
        .from('tracking_updates')
        .select('*')
        .eq('booking_id', id)
        .order('created_at', { ascending: false });

      if (trackingError) throw trackingError;
      setTrackingUpdates(trackingData || []);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchNumber.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          from_station:railway_stations!bookings_from_station_id_fkey(station_name, station_code),
          to_station:railway_stations!bookings_to_station_id_fkey(station_name, station_code)
        `)
        .eq('booking_number', searchNumber.trim())
        .single();

      if (error) throw error;
      
      navigate(`/track-booking?id=${data.id}`);
      fetchBookingDetails(data.id);
    } catch (error) {
      console.error('Booking not found:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: 'outline',
      confirmed: 'default',
      in_transit: 'secondary',
      delivered: 'default',
      cancelled: 'destructive',
    };
    return variants[status] || 'secondary';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Track Booking</h1>
              <p className="text-sm text-muted-foreground">Track your parcel shipment</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        {!booking && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Enter Booking Number</CardTitle>
              <CardDescription>Track your shipment by entering the booking number</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="RPB-20250127-1234"
                    value={searchNumber}
                    onChange={(e) => setSearchNumber(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit">
                  <Search className="mr-2 h-4 w-4" />
                  Track
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {booking && (
          <>
            {/* Booking Details */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{booking.booking_number}</CardTitle>
                    <CardDescription>
                      Booked on {format(new Date(booking.booking_date), 'PPP')}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusVariant(booking.status)}>
                    {booking.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Route
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">From</p>
                        <p className="font-medium">
                          {booking.from_station.station_name} ({booking.from_station.station_code})
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">To</p>
                        <p className="font-medium">
                          {booking.to_station.station_name} ({booking.to_station.station_code})
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      Details
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Sender</p>
                        <p className="font-medium">{booking.sender_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Receiver</p>
                        <p className="font-medium">{booking.receiver_name}</p>
                      </div>
                      {booking.expected_delivery_date && (
                        <div>
                          <p className="text-sm text-muted-foreground">Expected Delivery</p>
                          <p className="font-medium">
                            {format(new Date(booking.expected_delivery_date), 'PPP')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Tracking History</CardTitle>
                <CardDescription>Shipment status updates</CardDescription>
              </CardHeader>
              <CardContent>
                {trackingUpdates.length === 0 ? (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                        <div className="h-full w-0.5 bg-border mt-2" />
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium">BOOKING CONFIRMED</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(booking.booking_date), 'PPp')}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {booking.from_station.station_name}
                        </p>
                        <p className="text-sm">Your booking has been confirmed and is being processed.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-muted" />
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium text-muted-foreground">AWAITING PICKUP</p>
                          <p className="text-sm text-muted-foreground">Pending</p>
                        </div>
                        <p className="text-sm text-muted-foreground">Parcel will be picked up soon.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trackingUpdates.map((update, index) => (
                      <div key={update.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="h-3 w-3 rounded-full bg-primary" />
                          {index < trackingUpdates.length - 1 && (
                            <div className="h-full w-0.5 bg-border mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex items-start justify-between mb-1">
                            <p className="font-medium">{update.status.replace('_', ' ').toUpperCase()}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(update.created_at), 'PPp')}
                            </p>
                          </div>
                          {update.location && (
                            <p className="text-sm text-muted-foreground mb-1">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {update.location}
                            </p>
                          )}
                          <p className="text-sm">{update.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
