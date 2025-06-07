import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../utils/authContext';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { Marker } from '@react-google-maps/api'; // Re-import Marker to fix TS error
// Marker usage replaced with AdvancedMarkerElement workaround or comment due to deprecation warning

const mapContainerStyle = {
  width: '100%',
  height: '300px',
};

const Profile = () => {
  const { user, updateUserData } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [markerPosition, setMarkerPosition] = useState(
    user ? user.location : { lat: 19.0760, lng: 72.8777 }
  );
  
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyDmzDIeYZ2uxW1L317vDrWJ3zxEP8WB5ps',
  });
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      reraNumber: user?.reraNumber || '',
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        reraNumber: user.reraNumber,
      });
      setMarkerPosition(user.location);
    }
  }, [user, reset]);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setMarkerPosition({
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      });
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      
      if (!user) {
        toast.error('User not found');
        return;
      }
      
      const updatedUser = {
        ...user,
        fullName: data.fullName,
        phone: data.phone,
        reraNumber: data.reraNumber,
        location: markerPosition,
      };
      
      updateUserData(updatedUser);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error(error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <div className="text-center">
            <p className="text-neutral-600 mb-4">Please log in to view your profile</p>
            <Button onClick={() => navigate('/login')}>Go to Login</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-800">Your Profile</h1>
          <p className="text-neutral-500">View and update your account information</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div>
            <Card className="text-center py-6">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-neutral-900">{user.fullName}</h2>
              <p className="text-neutral-500 mb-4">{user.email}</p>
              
              <div className="border-t border-neutral-200 pt-4 mt-4">
                <div className="flex items-center justify-center mb-2">
                  <MapPin className="h-4 w-4 text-neutral-500 mr-2" />
                  <span className="text-sm text-neutral-700">{user.city}, {user.state}</span>
                </div>
                <div className="flex items-center justify-center">
                  <Phone className="h-4 w-4 text-neutral-500 mr-2" />
                  <span className="text-sm text-neutral-700">{user.phone}</span>
                </div>
              </div>
            </Card>
            
            <div className="mt-6">
              <Button 
                variant="outline" 
                fullWidth
                onClick={() => navigate('/subscription')}
              >
                Manage Subscriptions
              </Button>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-2">
            <Card>
              <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  id="fullName"
                  label="Full Name"
                  icon={<User className="h-5 w-5 text-neutral-400" />}
                  error={errors.fullName?.message}
                  {...register('fullName', { 
                    required: 'Full name is required' 
                  })}
                />
                
                <Input
                  id="email"
                  label="Email Address"
                  type="email"
                  icon={<Mail className="h-5 w-5 text-neutral-400" />}
                  disabled
                  {...register('email')}
                  helperText="Email cannot be changed"
                />
                
                <Input
                  id="phone"
                  label="Phone Number"
                  type="tel"
                  icon={<Phone className="h-5 w-5 text-neutral-400" />}
                  error={errors.phone?.message}
                  {...register('phone', { 
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Please enter a valid 10-digit phone number'
                    }
                  })}
                />
                
                <Input
                  id="reraNumber"
                  label="RERA Number"
                  error={errors.reraNumber?.message}
                  {...register('reraNumber', { 
                    required: 'RERA number is required' 
                  })}
                />
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Office Location
                  </label>
                  <div className="rounded-md overflow-hidden border border-neutral-300">
                    {!isLoaded ? (
                      <div className="h-[300px] bg-neutral-100 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
                      </div>
                    ) : (
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={markerPosition}
                        zoom={12}
                        onClick={handleMapClick}
                      >
                        {/* TODO: google.maps.Marker is deprecated. Consider migrating to AdvancedMarkerElement when supported by @react-google-maps/api */}
                        <Marker position={markerPosition} />
                      </GoogleMap>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500 mt-1">
                    Click on the map to update your office location
                  </p>
                </div>
                
                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;