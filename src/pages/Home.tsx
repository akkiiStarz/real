import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building, Search, MapPin, Home as HomeIcon, ArrowRight, Briefcase, Shield } from 'lucide-react';
import { useAuth } from '../utils/authContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { fetchBanners } from '../utils/api';
import { Banner } from '../types';
import { getUserSubscribedLocations } from '../utils/helper';
import logo from '../assets/logo.png';

const Home = () => {
  const { user } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBanners = async () => {
      setLoading(true);
      let locations = ['Mumbai', 'Thane', 'Mira Road']; // Default locations
      
      if (user) {
        const userLocations = getUserSubscribedLocations(user);
        if (userLocations.length > 0) {
          locations = userLocations;
        }
      }
      
      const data = await fetchBanners(locations);
      setBanners(data);
      setLoading(false);
    };
    
    loadBanners();
  }, [user]);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Your One-Stop Platform for Real Estate Brokers
              </h1>
              <p className="text-lg mb-8 text-neutral-100">
                Connect with clients, manage your inventory, and grow your real estate business with EstateX.
              </p>
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" className="mr-4">
                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <Link to="/signup">
                    <Button size="lg">
                      Sign Up Now
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg" className="text-white border-white hover:bg-primary-light">
                      Login
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-500 hover:scale-105">
                <div className="h-64 bg-neutral-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="bg-white/90 rounded-xl shadow-2xl p-4 transition duration-300 hover:bg-white hover:shadow-2xl hover:scale-105">
                      <img 
                        src={logo} 
                        alt="Logo" 
                        className="w-44 h-44 object-contain opacity-100 transition duration-300 hover:opacity-100 drop-shadow-lg"
                      />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6 z-20">
                    <div className="flex items-center space-x-4">
                      {/* <img src={logo} alt="Logo" className="h-12 w-12 object-contain" /> */}
                      <div>
                        <h3 className="text-white text-xl font-bold">Premium Properties</h3>
                        <p className="text-neutral-200">Exclusive access to high-value listings</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Section */}
      {banners.length > 0 && (
        <section className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-neutral-800 mb-6">Featured Properties</h2>
            <div className="relative overflow-hidden rounded-lg shadow-md">
              <div className="aspect-w-16 aspect-h-6 relative">
                {loading ? (
                  <div className="w-full h-64 bg-neutral-200 animate-pulse"></div>
                ) : (
                  <>
                    <img 
                      src={banners[currentBanner].imageUrl} 
                      alt={banners[currentBanner].title}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                      <div>
                        <h3 className="text-white text-xl font-bold">{banners[currentBanner].title}</h3>
                        <div className="flex items-center text-neutral-200">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{banners[currentBanner].location}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              {banners.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentBanner ? 'bg-white' : 'bg-white/50'
                      }`}
                      onClick={() => setCurrentBanner(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-neutral-800 mb-12">Why Choose Estatex?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Find Properties Faster</h3>
                <p className="text-neutral-600">
                  Our advanced filtering system helps you find the perfect property match for your clients in seconds.
                </p>
              </div>
            </Card>
            
            <Card className="transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Manage Your Inventory</h3>
                <p className="text-neutral-600">
                  Upload and manage all your property listings in one place with our easy-to-use inventory management system.
                </p>
              </div>
            </Card>
            
            <Card className="transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Subscription Based</h3>
                <p className="text-neutral-600">
                  Choose the locations you want to serve and pay only for what you need with our flexible subscription model.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
          <section className="py-16 bg-accent text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Real Estate Business?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of successful real estate brokers who are already using EstateX to find properties and close deals faster.
          </p>
          {user ? (
            <Link to="/subscription">
              <Button className="text-black" variant="primary">
                Explore Subscription Plans
              </Button>
            </Link>
          ) : (
            <Link to="/signup">
              <Button variant="primary" size="lg" className="bg-white text-black hover:bg-neutral-100">
                Sign Up Now
              </Button>
            </Link>
          )}
        </div>
      </section>
        </div>
  );
};

export default Home;