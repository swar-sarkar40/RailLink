import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Users, Package, Loader2, DollarSign, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [cargoAvailability, setCargoAvailability] = useState<any[]>([]);
  const [commodityCategories, setCommodityCategories] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [isAddSlotDialogOpen, setIsAddSlotDialogOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({
    fromStationId: '',
    toStationId: '',
    commodityId: '',
    availableDate: '',
    totalCapacity: '',
    pricePerKg: '',
  });

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data.role !== 'admin') {
        toast({
          title: 'Access Denied',
          description: 'You do not have admin privileges',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }

      setIsAdmin(true);
      fetchData();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/dashboard');
    }
  };

  const fetchData = async () => {
    try {
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          *,
          from_station:railway_stations!bookings_from_station_id_fkey(station_name),
          to_station:railway_stations!bookings_to_station_id_fkey(station_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      const { data: cargoData } = await supabase
        .from('cargo_availability')
        .select(`
          *,
          from_station:railway_stations!cargo_availability_from_station_id_fkey(station_name, station_code),
          to_station:railway_stations!cargo_availability_to_station_id_fkey(station_name, station_code),
          commodity:commodity_categories(name)
        `)
        .order('available_date', { ascending: false });

      const { data: commoditiesData } = await supabase
        .from('commodity_categories')
        .select('*')
        .order('name');

      const { data: stationsData } = await supabase
        .from('railway_stations')
        .select('*')
        .eq('is_active', true)
        .order('station_name');

      setBookings(bookingsData || []);
      setUsers(profilesData || []);
      setCargoAvailability(cargoData || []);
      setCommodityCategories(commoditiesData || []);
      setStations(stationsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: 'Booking status has been updated successfully',
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const updateCargoAvailability = async (cargoId: string, field: string, value: number) => {
    try {
      const { error } = await supabase
        .from('cargo_availability')
        .update({ [field]: value })
        .eq('id', cargoId);

      if (error) throw error;

      toast({
        title: 'Updated Successfully',
        description: 'Cargo availability has been updated',
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const updateCommodityPrice = async (commodityId: string, newPrice: number) => {
    try {
      const { error } = await supabase
        .from('commodity_categories')
        .update({ base_rate_per_kg: newPrice })
        .eq('id', commodityId);

      if (error) throw error;

      toast({
        title: 'Price Updated',
        description: 'Commodity price has been updated successfully',
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const addCargoSlot = async () => {
    try {
      if (!newSlot.fromStationId || !newSlot.toStationId || !newSlot.commodityId || 
          !newSlot.availableDate || !newSlot.totalCapacity || !newSlot.pricePerKg) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all fields',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('cargo_availability')
        .insert({
          from_station_id: newSlot.fromStationId,
          to_station_id: newSlot.toStationId,
          commodity_category_id: newSlot.commodityId,
          available_date: newSlot.availableDate,
          total_capacity_kg: parseFloat(newSlot.totalCapacity),
          booked_capacity_kg: 0,
          price_per_kg: parseFloat(newSlot.pricePerKg),
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'New cargo slot added successfully',
      });

      setIsAddSlotDialogOpen(false);
      setNewSlot({
        fromStationId: '',
        toStationId: '',
        commodityId: '',
        availableDate: '',
        totalCapacity: '',
        pricePerKg: '',
      });
      fetchData();
    } catch (error: any) {
      console.error('Error adding cargo slot:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add cargo slot',
        variant: 'destructive',
      });
    }
  };

  const deleteCargoSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this cargo slot? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('cargo_availability')
        .delete()
        .eq('id', slotId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Cargo slot deleted successfully',
      });

      fetchData();
    } catch (error: any) {
      console.error('Error deleting cargo slot:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete cargo slot',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_transit: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading || !isAdmin) {
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
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Manage system and users</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bookings.filter((b) => b.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bookings.filter((b) => b.status === 'in_transit').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="bookings">All Bookings</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="slots">Slot & Price Management</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>Manage all system bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking Number</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.booking_number}</TableCell>
                        <TableCell>
                          {booking.from_station?.station_name} → {booking.to_station?.station_name}
                        </TableCell>
                        <TableCell>{format(new Date(booking.booking_date), 'PP')}</TableCell>
                        <TableCell>₹{booking.total_amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={booking.status}
                            onValueChange={(value) => updateBookingStatus(booking.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="in_transit">In Transit</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>System Users</CardTitle>
                <CardDescription>View all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell>{user.phone || '-'}</TableCell>
                        <TableCell>{user.company_name || '-'}</TableCell>
                        <TableCell>
                          {user.city && user.state ? `${user.city}, ${user.state}` : '-'}
                        </TableCell>
                        <TableCell>{format(new Date(user.created_at), 'PP')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="slots" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Cargo Availability Management</CardTitle>
                    <CardDescription>Manage cargo slots and pricing for routes</CardDescription>
                  </div>
                  <Dialog open={isAddSlotDialogOpen} onOpenChange={setIsAddSlotDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Slot
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add New Cargo Slot</DialogTitle>
                        <DialogDescription>
                          Create a new cargo availability slot for a specific route
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="fromStation">From Station</Label>
                          <Select
                            value={newSlot.fromStationId}
                            onValueChange={(value) => setNewSlot({ ...newSlot, fromStationId: value })}
                          >
                            <SelectTrigger id="fromStation">
                              <SelectValue placeholder="Select origin station" />
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
                          <Label htmlFor="toStation">To Station</Label>
                          <Select
                            value={newSlot.toStationId}
                            onValueChange={(value) => setNewSlot({ ...newSlot, toStationId: value })}
                          >
                            <SelectTrigger id="toStation">
                              <SelectValue placeholder="Select destination station" />
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
                          <Label htmlFor="commodity">Commodity</Label>
                          <Select
                            value={newSlot.commodityId}
                            onValueChange={(value) => setNewSlot({ ...newSlot, commodityId: value })}
                          >
                            <SelectTrigger id="commodity">
                              <SelectValue placeholder="Select commodity type" />
                            </SelectTrigger>
                            <SelectContent>
                              {commodityCategories.map((commodity) => (
                                <SelectItem key={commodity.id} value={commodity.id}>
                                  {commodity.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="date">Available Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={newSlot.availableDate}
                            onChange={(e) => setNewSlot({ ...newSlot, availableDate: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="capacity">Total Capacity (kg)</Label>
                          <Input
                            id="capacity"
                            type="number"
                            placeholder="e.g., 5000"
                            value={newSlot.totalCapacity}
                            onChange={(e) => setNewSlot({ ...newSlot, totalCapacity: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="price">Price per kg (₹)</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            placeholder="e.g., 15.50"
                            value={newSlot.pricePerKg}
                            onChange={(e) => setNewSlot({ ...newSlot, pricePerKg: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddSlotDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={addCargoSlot}>Add Slot</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route</TableHead>
                      <TableHead>Commodity</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total Capacity (kg)</TableHead>
                      <TableHead>Available (kg)</TableHead>
                      <TableHead>Price/kg (₹)</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cargoAvailability.map((cargo) => (
                      <TableRow key={cargo.id}>
                        <TableCell>
                          {cargo.from_station?.station_name} → {cargo.to_station?.station_name}
                        </TableCell>
                        <TableCell>{cargo.commodity?.name}</TableCell>
                        <TableCell>{format(new Date(cargo.available_date), 'PP')}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            defaultValue={cargo.total_capacity_kg}
                            onBlur={(e) => {
                              const value = parseFloat(e.target.value);
                              if (value !== cargo.total_capacity_kg) {
                                updateCargoAvailability(cargo.id, 'total_capacity_kg', value);
                              }
                            }}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{cargo.available_capacity_kg}</span>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            defaultValue={cargo.price_per_kg}
                            onBlur={(e) => {
                              const value = parseFloat(e.target.value);
                              if (value !== cargo.price_per_kg) {
                                updateCargoAvailability(cargo.id, 'price_per_kg', value);
                              }
                            }}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Badge variant={cargo.available_capacity_kg > 1000 ? 'default' : 'secondary'}>
                              {cargo.available_capacity_kg > 1000 ? 'Available' : 'Limited'}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteCargoSlot(cargo.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commodity Base Rates</CardTitle>
                <CardDescription>Update base rates per kg for different commodities</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Commodity</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Base Rate (₹/kg)</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commodityCategories.map((commodity) => (
                      <TableRow key={commodity.id}>
                        <TableCell className="font-medium">{commodity.name}</TableCell>
                        <TableCell>{commodity.description || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              step="0.01"
                              defaultValue={commodity.base_rate_per_kg}
                              onBlur={(e) => {
                                const value = parseFloat(e.target.value);
                                if (value !== commodity.base_rate_per_kg) {
                                  updateCommodityPrice(commodity.id, value);
                                }
                              }}
                              className="w-28"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={commodity.is_active ? 'default' : 'secondary'}>
                            {commodity.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
