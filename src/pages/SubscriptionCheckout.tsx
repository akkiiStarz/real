import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Calendar, Building, Lock, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../utils/authContext';
import { formatCurrency, calculateSubscriptionTotal } from '../utils/helper';

interface CheckoutFormData {
  cardName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

const SubscriptionCheckout = () => {
  const navigate = useNavigate();
  const { user, updateUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [total, setTotal] = useState(0);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<CheckoutFormData>();

  useEffect(() => {
    if (user) {
      setTotal(calculateSubscriptionTotal(user.subscriptionLocations));
    }
  }, [user]);

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      setIsLoading(true);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setShowSuccess(true);
      
      // Redirect to dashboard after success
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (error) {
      console.error(error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <div className="text-center">
            <p className="text-neutral-600 mb-4">Please log in to continue</p>
            <Button onClick={() => navigate('/login')}>Go to Login</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Payment Successful!</h2>
            <p className="text-neutral-600 mb-6">
              Your subscription has been activated successfully.
            </p>
            <Button variant="primary" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Complete Your Subscription</h1>
          <p className="mt-2 text-neutral-600">
            Enter your payment details to activate your subscription
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <CreditCard className="mr-2 h-5 w-5 text-primary" /> Payment Information
              </h2>
              
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4">
                  <Input
                    id="cardName"
                    label="Cardholder Name"
                    placeholder="John Smith"
                    error={errors.cardName?.message}
                    {...register('cardName', { 
                      required: 'Cardholder name is required' 
                    })}
                  />
                  
                  <Input
                    id="cardNumber"
                    label="Card Number"
                    placeholder="1234 5678 9012 3456"
                    error={errors.cardNumber?.message}
                    {...register('cardNumber', { 
                      required: 'Card number is required',
                      pattern: {
                        value: /^[0-9]{16}$/,
                        message: 'Please enter a valid 16-digit card number'
                      }
                    })}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      id="expiryDate"
                      label="Expiry Date (MM/YY)"
                      placeholder="MM/YY"
                      error={errors.expiryDate?.message}
                      {...register('expiryDate', { 
                        required: 'Expiry date is required',
                        pattern: {
                          value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                          message: 'Please enter a valid expiry date (MM/YY)'
                        }
                      })}
                    />
                    
                    <Input
                      id="cvv"
                      label="CVV"
                      type="password"
                      placeholder="123"
                      error={errors.cvv?.message}
                      {...register('cvv', { 
                        required: 'CVV is required',
                        pattern: {
                          value: /^[0-9]{3,4}$/,
                          message: 'Please enter a valid CVV'
                        }
                      })}
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      isLoading={isLoading}
                    >
                      Pay {formatCurrency(total)}
                    </Button>
                    
                    <div className="flex items-center justify-center mt-4 text-sm text-neutral-500">
                      <Lock className="h-4 w-4 mr-1" />
                      <span>Secure payment processed by Stripe</span>
                    </div>
                  </div>
                </div>
              </form>
            </Card>
          </div>
          
          <div>
            <Card>
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                {user.subscriptionLocations.map((location) => (
                  <div key={location.id} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-primary mr-2" />
                      <span>{location.name}</span>
                    </div>
                    <span>{formatCurrency(location.price)}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <div className="flex justify-between items-center font-semibold">
                  <span>Subtotal</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-neutral-500 mt-1">
                  <span>Tax</span>
                  <span>₹0</span>
                </div>
                <div className="flex justify-between items-center font-bold text-lg mt-4">
                  <span>Total</span>
                  <span className="text-accent">{formatCurrency(total)}</span>
                </div>
              </div>
              
              <div className="mt-6 text-sm text-neutral-600">
                <p className="flex items-start">
                  <Calendar className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                  <span>Your subscription will renew automatically every month</span>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCheckout;