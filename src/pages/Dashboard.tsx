import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, Train, Plus, LogOut, User, Settings, Search } from 'lucide-react';
import { Notifications } from '@/components/Notifications';
import { Logo } from '@/components/Logo';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';

interface UserProfile {
  id: string;
  full_name: string;
  phone: string | null;
  company_name: string | null;
  city: string | null;
  state: string | null;
}

interface UserRole {
  role: 'user' | 'agent' | 'admin';
}

interface Booking {
  id: string;
  booking_number: string;
  status: string;
  total_amount: number;
  booking_date: string;
  from_station: { station_name: string; station_code: string };
  to_station: { station_name: string; station_code: string };
}

export default function Dashboard() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<UserRole['role']>('user');
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchBookings();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (roleError) throw roleError;
      if (roleData) setUserRole(roleData.role);

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          from_station:railway_stations!bookings_from_station_id_fkey(station_name, station_code),
          to_station:railway_stations!bookings_to_station_id_fkey(station_name, station_code)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'agent': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header 
        className="bg-card shadow-sm border-b"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Logo size="md" />
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Notifications />
              <div className="text-right">
                <p className="text-sm font-medium">{profile.full_name}</p>
                <Badge variant={getRoleBadgeVariant(userRole)}>
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="hover-lift">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {userRole === 'admin' ? (
          // Admin-only view
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">
                Admin Panel
              </h2>
              <p className="text-muted-foreground">
                Manage system settings, slots, prices, and view all bookings
              </p>
            </div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Button 
                variant="outline" 
                className="h-32 flex-col justify-center hover-lift" 
                onClick={() => navigate('/admin')}
              >
                <Settings className="h-10 w-10 mb-3" />
                <span className="font-semibold">Admin Dashboard</span>
                <span className="text-xs text-muted-foreground">Full system management</span>
              </Button>

              <Card className="h-32 flex flex-col justify-center hover-lift">
                <CardContent className="text-center">
                  <Package className="h-10 w-10 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">All Bookings</p>
                  <p className="text-2xl font-bold">{bookings.length}</p>
                </CardContent>
              </Card>

              <Card className="h-32 flex flex-col justify-center hover-lift">
                <CardContent className="text-center">
                  <User className="h-10 w-10 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">System Users</p>
                  <p className="text-sm text-muted-foreground">Manage roles & access</p>
                </CardContent>
              </Card>
            </motion.div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Access</CardTitle>
                <CardDescription>
                  Navigate to key admin functions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  size="lg"
                  onClick={() => navigate('/admin')}
                >
                  <Settings className="mr-2 h-5 w-5" />
                  Slot & Price Management
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  size="lg"
                  onClick={() => navigate('/admin')}
                >
                  <Package className="mr-2 h-5 w-5" />
                  View All Bookings
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  size="lg"
                  onClick={() => navigate('/admin')}
                >
                  <Train className="mr-2 h-5 w-5" />
                  Manage Stations
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          // Regular user view
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {profile.full_name}!
              </h2>
              <p className="text-muted-foreground">
                Manage your railway freight bookings and track consignments
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {bookings.filter(b => b.status !== 'delivered' && b.status !== 'cancelled').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {bookings.filter(b => b.status !== 'delivered' && b.status !== 'cancelled').length === 0 
                      ? 'No active bookings' 
                      : 'Currently active'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
                  <Train className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bookings.length}</div>
                  <p className="text-xs text-muted-foreground">Lifetime shipments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                  <div className="h-4 w-4 text-muted-foreground">₹</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{bookings.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.total_amount, 0).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {bookings.filter(b => b.status === 'pending').length} pending bookings
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Dashboard Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="bookings">My Bookings</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Start your freight booking process
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" size="lg" onClick={() => navigate('/new-booking')}>
                    <Plus className="mr-2 h-5 w-5" />
                    Create New Booking
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="lg" onClick={() => navigate('/check-availability')}>
                    <Search className="mr-2 h-5 w-5" />
                    Check Availability
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="lg" onClick={() => navigate('/my-bookings')}>
                    <Package className="mr-2 h-5 w-5" />
                    My Bookings
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="lg" onClick={() => navigate('/track-booking')}>
                    <Train className="mr-2 h-5 w-5" />
                    Track Consignment
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest booking activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {bookingsLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No recent activity</p>
                      <p className="text-sm">Start by creating your first booking</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bookings.slice(0, 3).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex-1">
                            <p className="font-medium">{booking.booking_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.from_station.station_code} → {booking.to_station.station_code}
                            </p>
                          </div>
                          <Badge variant={booking.status === 'delivered' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" onClick={() => navigate('/my-bookings')}>
                        View All Bookings
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>
                  View and manage all your freight bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Train className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
                    <p className="text-sm mb-6">Create your first freight booking to get started</p>
                    <Button onClick={() => navigate('/new-booking')}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Booking
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex-1">
                          <p className="font-semibold">{booking.booking_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.from_station.station_name} → {booking.to_station.station_name}
                          </p>
                          <p className="text-sm text-muted-foreground">₹{booking.total_amount.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={booking.status === 'delivered' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                          <Button variant="outline" size="sm" onClick={() => navigate(`/track-booking?id=${booking.id}`)}>
                            Track
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" onClick={() => navigate('/my-bookings')}>
                      View All Details
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Manage your account details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="text-sm">{profile.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-sm">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-sm">{profile.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Company</label>
                    <p className="text-sm">{profile.company_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">City</label>
                    <p className="text-sm">{profile.city || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">State</label>
                    <p className="text-sm">{profile.state || 'Not provided'}</p>
                  </div>
                </div>
                <div className="pt-4">
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}