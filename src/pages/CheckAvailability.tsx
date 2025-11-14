import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Package, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface Station {
  id: string;
  station_name: string;
  station_code: string;
}

interface Category {
  id: string;
  name: string;
}

interface AvailabilitySlot {
  id: string;
  available_date: string;
  available_capacity_kg: number;
  price_per_kg: number;
  from_station: { station_name: string; station_code: string };
  to_station: { station_name: string; station_code: string };
  commodity_category: { name: string };
}

export default function CheckAvailability() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availabilityResults, setAvailabilityResults] = useState<AvailabilitySlot[]>([]);
  
  const [formData, setFormData] = useState({
    fromStationId: '',
    toStationId: '',
    categoryId: '',
    weight: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    fetchStationsAndCategories();
  }, []);

  const fetchStationsAndCategories = async () => {
    const { data: stationsData } = await supabase
      .from('railway_stations')
      .select('id, station_name, station_code')
      .eq('is_active', true)
      .order('station_name');

    const { data: categoriesData } = await supabase
      .from('commodity_categories')
      .select('id, name')
      .eq('is_active', true)
      .order('name');

    if (stationsData) setStations(stationsData);
    if (categoriesData) setCategories(categoriesData);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('cargo_availability')
        .select(`
          id,
          available_date,
          available_capacity_kg,
          price_per_kg,
          from_station_id,
          to_station_id,
          commodity_category_id
        `)
        .eq('from_station_id', formData.fromStationId)
        .eq('to_station_id', formData.toStationId)
        .eq('commodity_category_id', formData.categoryId)
        .gte('available_date', formData.date)
        .order('available_date');

      if (error) throw error;

      // Fetch related data separately
      const enrichedData = await Promise.all((data || []).map(async (slot) => {
        const [fromStation, toStation, category] = await Promise.all([
          supabase.from('railway_stations').select('station_name, station_code').eq('id', slot.from_station_id).single(),
          supabase.from('railway_stations').select('station_name, station_code').eq('id', slot.to_station_id).single(),
          supabase.from('commodity_categories').select('name').eq('id', slot.commodity_category_id).single(),
        ]);

        return {
          ...slot,
          from_station: fromStation.data || { station_name: '', station_code: '' },
          to_station: toStation.data || { station_name: '', station_code: '' },
          commodity_category: category.data || { name: '' },
        };
      }));

      setAvailabilityResults(enrichedData);
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = (slot: AvailabilitySlot) => {
    const weight = parseFloat(formData.weight) || 0;
    const basePrice = weight * slot.price_per_kg;
    const tax = basePrice * 0.18;
    return basePrice + tax;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Check Availability</h1>
              <p className="text-sm text-muted-foreground">Find available cargo space for your shipment</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Availability</CardTitle>
            <CardDescription>Enter your shipment details to check available slots</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromStation">Origin Station *</Label>
                <Select
                  required
                  value={formData.fromStationId}
                  onValueChange={(value) => setFormData({ ...formData, fromStationId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select origin" />
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
                <Label htmlFor="toStation">Destination Station *</Label>
                <Select
                  required
                  value={formData.toStationId}
                  onValueChange={(value) => setFormData({ ...formData, toStationId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
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
                <Label htmlFor="category">Commodity Type *</Label>
                <Select
                  required
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
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
                <Label htmlFor="date">From Date *</Label>
                <Input
                  id="date"
                  required
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="flex items-end">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {availabilityResults.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Available Slots</h2>
            {availabilityResults.map((slot) => (
              <Card key={slot.id}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <p className="font-medium">{format(new Date(slot.available_date), 'PPP')}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Route</p>
                      <p className="font-medium">
                        {slot.from_station.station_code} → {slot.to_station.station_code}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Available Capacity</p>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <p className="font-medium">{slot.available_capacity_kg.toFixed(0)} kg</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rate</p>
                      <p className="font-medium">₹{slot.price_per_kg.toFixed(2)}/kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Cost</p>
                      <p className="font-bold text-primary">₹{calculateTotalPrice(slot).toFixed(2)}</p>
                      <Badge variant="secondary" className="mt-1">Inc. GST</Badge>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button onClick={() => navigate('/new-booking')} variant="outline" size="sm">
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : availabilityResults.length === 0 && !loading && formData.fromStationId ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Available Slots</h3>
              <p className="text-muted-foreground text-center">
                No cargo space available for the selected route and date.
                <br />
                Please try different dates or contact support.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </main>
    </div>
  );
}
