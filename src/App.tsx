import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ReactLenis } from "lenis/react";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NewBooking from "./pages/NewBooking";
import MyBookings from "./pages/MyBookings";
import TrackBooking from "./pages/TrackBooking";
import CheckAvailability from "./pages/CheckAvailability";
import AdminPanel from "./pages/AdminPanel";
import Payment from "./pages/Payment";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
          <TooltipProvider>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/new-booking" element={<NewBooking />} />
                  <Route path="/my-bookings" element={<MyBookings />} />
                  <Route path="/track-booking" element={<TrackBooking />} />
                  <Route path="/check-availability" element={<CheckAvailability />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/payment" element={<Payment />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </AuthProvider>
          </TooltipProvider>
        </ReactLenis>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
