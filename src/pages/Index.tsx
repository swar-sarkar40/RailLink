import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Train, Package, Shield, Clock, Zap, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: <Package className="h-8 w-8 text-blue-600" />,
      title: "Easy Booking",
      description: "Book railway freight space with just a few clicks. Select commodities, routes, and get instant pricing."
    },
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: "Secure Payments",
      description: "Multiple payment options including UPI, net banking, and cards with bank-level security."
    },
    {
      icon: <Clock className="h-8 w-8 text-purple-600" />,
      title: "Real-time Tracking",
      description: "Track your consignments in real-time from pickup to delivery with SMS and email updates."
    },
    {
      icon: <Zap className="h-8 w-8 text-orange-600" />,
      title: "Quick Processing",
      description: "Fast approval process with automated documentation and invoice generation."
    },
    {
      icon: <Users className="h-8 w-8 text-red-600" />,
      title: "Agent Support",
      description: "Dedicated agent support for businesses with high volume freight requirements."
    },
    {
      icon: <Train className="h-8 w-8 text-indigo-600" />,
      title: "Pan-India Network",
      description: "Access to extensive railway network covering major stations across India."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950">
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-card/50 backdrop-blur-lg shadow-sm border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Logo size="md" />
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button variant="outline" onClick={() => navigate('/auth')} className="hover-lift">
                Sign In
              </Button>
              <Button onClick={() => navigate('/auth')} className="hover-lift">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h2 
            className="text-4xl md:text-6xl font-bold text-foreground mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Railway Freight
            <motion.span 
              className="text-primary block"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Made Simple
            </motion.span>
          </motion.h2>
          <motion.p 
            className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Book railway freight space online for transporting goods across India. 
            Fast, secure, and reliable commodity reservation system with real-time tracking.
          </motion.p>
          <motion.div 
            className="space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button size="lg" onClick={() => navigate('/auth')} className="hover-lift">
              Start Booking Now
            </Button>
            <Button variant="outline" size="lg" className="hover-lift">
              Learn More
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-3xl font-bold text-foreground mb-4">
            Why Choose Our Platform?
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Modern technology meets traditional railway freight services to provide 
            you with the best booking experience.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="hover-lift h-full bg-card/50 backdrop-blur-sm border-border">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <motion.section 
        className="bg-primary/90 backdrop-blur-sm text-primary-foreground"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl font-bold mb-4">
              Ready to Start Shipping?
            </h3>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of businesses already using our platform for their freight needs
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={() => navigate('/auth')}
              className="hover-lift"
            >
              Create Account Today
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-card/30 backdrop-blur-sm text-foreground border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants}>
              <div className="flex items-center mb-4">
                <Train className="h-6 w-6 text-primary mr-2" />
                <span className="font-bold">Railway Freight System</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Simplifying railway freight booking across India with modern technology and reliable service.
              </p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <h4 className="font-semibold mb-3">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary smooth-transition cursor-pointer">Commodity Booking</li>
                <li className="hover:text-primary smooth-transition cursor-pointer">Real-time Tracking</li>
                <li className="hover:text-primary smooth-transition cursor-pointer">Payment Processing</li>
                <li className="hover:text-primary smooth-transition cursor-pointer">Invoice Management</li>
              </ul>
            </motion.div>
            <motion.div variants={itemVariants}>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary smooth-transition cursor-pointer">Help Center</li>
                <li className="hover:text-primary smooth-transition cursor-pointer">Contact Us</li>
                <li className="hover:text-primary smooth-transition cursor-pointer">Agent Support</li>
                <li className="hover:text-primary smooth-transition cursor-pointer">Documentation</li>
              </ul>
            </motion.div>
            <motion.div variants={itemVariants}>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary smooth-transition cursor-pointer">Privacy Policy</li>
                <li className="hover:text-primary smooth-transition cursor-pointer">Terms of Service</li>
                <li className="hover:text-primary smooth-transition cursor-pointer">Refund Policy</li>
                <li className="hover:text-primary smooth-transition cursor-pointer">Railway Guidelines</li>
              </ul>
            </motion.div>
          </motion.div>
          <motion.div 
            className="border-t border-border mt-8 pt-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-muted-foreground text-sm">
              © 2025 Railway Freight System. All rights reserved.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
