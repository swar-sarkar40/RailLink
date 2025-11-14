-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('user', 'agent', 'admin');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  gst_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create commodity categories table
CREATE TABLE public.commodity_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  base_rate_per_kg DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create railway stations table
CREATE TABLE public.railway_stations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  station_code TEXT NOT NULL UNIQUE,
  station_name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commodity_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.railway_stations ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policies for user_roles
CREATE POLICY "Users can view their own roles" 
  ON public.user_roles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" 
  ON public.user_roles FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Create policies for commodity categories (public read, admin write)
CREATE POLICY "Anyone can view commodity categories" 
  ON public.commodity_categories FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage commodity categories" 
  ON public.commodity_categories FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Create policies for railway stations (public read, admin write)
CREATE POLICY "Anyone can view railway stations" 
  ON public.railway_stations FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage railway stations" 
  ON public.railway_stations FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (user_id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', '')
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_commodity_categories_updated_at
  BEFORE UPDATE ON public.commodity_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample commodity categories
INSERT INTO public.commodity_categories (name, description, base_rate_per_kg) VALUES
  ('Agricultural Products', 'Grains, pulses, fruits, vegetables', 2.50),
  ('Industrial Goods', 'Machinery, equipment, manufactured items', 5.00),
  ('Raw Materials', 'Iron ore, coal, cement, chemicals', 3.00),
  ('Textiles', 'Cotton, fabric, garments', 4.00),
  ('Food Items', 'Packaged food, beverages', 3.50);

-- Insert sample railway stations
INSERT INTO public.railway_stations (station_code, station_name, city, state, zone) VALUES
  ('NDLS', 'New Delhi', 'New Delhi', 'Delhi', 'Northern Railway'),
  ('CSMT', 'Chhatrapati Shivaji Maharaj Terminus', 'Mumbai', 'Maharashtra', 'Central Railway'),
  ('HWH', 'Howrah Junction', 'Kolkata', 'West Bengal', 'Eastern Railway'),
  ('MAS', 'Chennai Central', 'Chennai', 'Tamil Nadu', 'Southern Railway'),
  ('BLR', 'Bangalore City Junction', 'Bangalore', 'Karnataka', 'South Western Railway'),
  ('JP', 'Jaipur Junction', 'Jaipur', 'Rajasthan', 'North Western Railway'),
  ('PUNE', 'Pune Junction', 'Pune', 'Maharashtra', 'Central Railway'),
  ('LKO', 'Lucknow Charbagh', 'Lucknow', 'Uttar Pradesh', 'Northern Railway');