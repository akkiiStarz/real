import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building, User, Phone, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
// Marker usage replaced with AdvancedMarkerElement workaround or comment due to deprecation warning
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { useAuth } from '../utils/authContext';
import { fetchStates, fetchCities } from '../utils/api';
import { State, City } from '../types';
import { generateId } from '../utils/localStorage';

const mapContainerStyle = {
  width: '100%',
  height: '300px',
};

const center = {
  lat: 19.0760,
  lng: 72.8777,
};

interface SignupFormData {
  fullName: string;
  phone: string;
  email: string;
  reraNumber: string;
  state: string;
  city: string;
  password: string;
  confirmPassword: string;
}

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedStateCode, setSelectedStateCode] = useState('');
  const [markerPosition, setMarkerPosition] = useState(center);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors },
    trigger
  } = useForm<SignupFormData>();
  
  const password = watch('password');

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyDmzDIeYZ2uxW1L317vDrWJ3zxEP8WB5ps',
  });

  useEffect(() => {
    const loadStates = async () => {
      try {
        const statesData = await fetchStates();
        setStates(statesData);
      } catch (error: any) {
        console.error('Failed to load states:', error);
        toast.error('Failed to load states. Please try again later.');
      }
    };
    loadStates();
  }, []);

  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateCode = e.target.value;
    setSelectedStateCode(stateCode);
    
    if (stateCode) {
      try {
        const citiesData = await fetchCities(stateCode);
        setCities(citiesData);
      } catch (error: any) {
        console.error('Failed to load cities:', error);
        toast.error('Failed to load cities. Please try again later.');
        setCities([]);
      }
    } else {
      setCities([]);
    }
  };

const handleMapClick = (e: google.maps.MapMouseEvent) => {
  if (e.latLng) {
    const newPos = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setMarkerPosition(newPos);
  }
};

  const nextStep = async () => {
    const isValid = await trigger();
    if (isValid) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      if (data.password !== data.confirmPassword) {
        toast.error('Passwords do not match');
        setIsLoading(false);
        return;
      }
      
      const userData = {
        id: generateId(),
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        reraNumber: data.reraNumber,
        state: data.state,
        city: data.city,
        password: data.password,
        location: markerPosition,
        subscriptionLocations: [],
      };
      
      const success = await signup(userData);
      
      if (success) {
        toast.success('Account created successfully!');
        if (!userData.subscriptionLocations || userData.subscriptionLocations.length === 0) {
          navigate('/subscription');
          return null;
        }
      } else {
        toast.error('Email already exists');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error('An error occurred during signup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Building className="h-12 w-12 text-accent" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent hover:text-accent-dark">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <Card>
          <div className="mb-6">
            <div className="flex items-center">
              <div className={`flex-1 border-t-2 ${step >= 1 ? 'border-accent' : 'border-neutral-300'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${step >= 1 ? 'bg-accent' : 'bg-neutral-300'}`}>1</div>
              <div className={`flex-1 border-t-2 ${step >= 2 ? 'border-accent' : 'border-neutral-300'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${step >= 2 ? 'bg-accent' : 'bg-neutral-300'}`}>2</div>
              <div className="flex-1 border-t-2 border-neutral-300"></div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm font-medium text-neutral-700 w-1/2 text-center">Personal Info</span>
              <span className="text-sm font-medium text-neutral-700 w-1/2 text-center">Location</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 && (
              <div className="space-y-4">
                <Input
                  id="fullName"
                  label="Full Name"
                  autoComplete="name"
                  error={errors.fullName?.message}
                  {...register('fullName', { 
                    required: 'Full name is required' 
                  })}
                  icon={<User className="h-5 w-5 text-neutral-400" />}
                />

                <Input
                  id="phone"
                  label="Phone Number"
                  type="tel"
                  autoComplete="tel"
                  error={errors.phone?.message}
                  {...register('phone', { 
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Please enter a valid 10-digit phone number'
                    }
                  })}
                  icon={<Phone className="h-5 w-5 text-neutral-400" />}
                />

                <Input
                  id="email"
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: 'Invalid email address'
                    }
                  })}
                  icon={<Mail className="h-5 w-5 text-neutral-400" />}
                />

                <Input
                  id="reraNumber"
                  label="RERA Number"
                  error={errors.reraNumber?.message}
                  {...register('reraNumber', { 
                    required: 'RERA number is required' 
                  })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                <Input
                  id="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  error={errors.password?.message}
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    },
                    pattern: {
                      value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/,
                      message: 'Password must contain letters, numbers, and special characters'
                    }
                  })}
                  // Removed lock icon as per user request
                />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-neutral-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-neutral-500" />
                    )}
                  </button>
                </div>

                <div className="relative">
                <Input
                  id="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => value === password || "Passwords do not match"
                  })}
                  // Removed lock icon as per user request
                />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-neutral-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-neutral-500" />
                    )}
                  </button>
                </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="button"
                    variant="primary"
                    fullWidth
                    onClick={nextStep}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <Select
                  id="state"
                  label="State"
                  options={states.map(state => ({ value: state.iso2, label: state.name }))}
                  error={errors.state?.message}
                  {...register('state', { 
                    required: 'State is required' 
                  })}
                  onChange={e => {
                    handleStateChange(e);
                    register('state').onChange(e);
                  }}
                />

                <Select
                  id="city"
                  label="City"
                  options={cities.map((city, idx) => ({
                    value: city.name,
                    label: city.name,
                    key: `${city.name}-${idx}` // Ensures uniqueness
                  }))}
                  error={errors.city?.message}
                  disabled={!selectedStateCode}
                  {...register('city', { required: 'City is required' })}
                />

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Pin Your Location on Map
                  </label>
                  <div className="rounded-md overflow-hidden border border-neutral-300">
                    {!isLoaded ? (
                      <div className="h-[300px] bg-neutral-100 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
                      </div>
                    ) : (
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={center}
                        zoom={12}
                        onClick={handleMapClick}
                      >
                        {/* TODO: google.maps.Marker is deprecated. Consider migrating to AdvancedMarkerElement when supported by @react-google-maps/api */}
                        <Marker key={`${markerPosition.lat}-${markerPosition.lng}`} position={markerPosition} />
                      </GoogleMap>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500 mt-1">
                    Click on the map to set your office location
                  </p>
                </div>

                <div className="pt-4 flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    fullWidth
                  >
                    Create Account
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Signup;