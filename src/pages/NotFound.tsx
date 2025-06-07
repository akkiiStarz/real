import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Home } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
            <MapPin className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-800 mb-2">404</h1>
          <p className="text-xl font-medium text-neutral-700 mb-1">Page Not Found</p>
          <p className="text-neutral-500">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>
        
        <Button 
          variant="primary" 
          icon={<Home className="h-4 w-4 mr-2" />}
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;