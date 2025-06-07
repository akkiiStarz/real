import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building, Check, ArrowRight } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useAuth } from "../utils/authContext";
import { SubscriptionLocation } from "../types";
import { formatCurrency } from "../utils/helper";
import toast from "react-hot-toast";
interface LocationOption {
  id: string;
  name: string;
  price: number;
  isSelected: boolean;
}

const initialLocations: LocationOption[] = [
  { id: "1", name: "Mumbai", price: 1500, isSelected: false },
  { id: "2", name: "Thane", price: 1000, isSelected: false },
  { id: "3", name: "Mira Road", price: 800, isSelected: false },
  { id: "4", name: "Dahisar", price: 800, isSelected: false },
  { id: "5", name: "Bhayandar", price: 800, isSelected: false },
  { id: "6", name: "Delhi", price: 1500, isSelected: false },
  { id: "7", name: "Bangalore", price: 1200, isSelected: false },
  { id: "8", name: "Pune", price: 1000, isSelected: false },
];


const Subscription = () => {
  const navigate = useNavigate();
  const { user, updateUserData, loading } = useAuth();
  const [locations, setLocations] = useState<LocationOption[]>(initialLocations);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (user && user.subscriptionLocations) {
      const updatedLocations = locations.map((loc) => ({
        ...loc,
        isSelected: user.subscriptionLocations.some(
          (subscription) => subscription.name === loc.name
        ),
      }));
      setLocations(updatedLocations);
      const selected = updatedLocations.filter((loc) => loc.isSelected);
      setTotal(selected.reduce((sum, loc) => sum + loc.price, 0));
    }
    // eslint-disable-next-line
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!loading && !user) {
    navigate("/login");
    return null;
  }

  const toggleLocation = (id: string) => {
    const updatedLocations = locations.map((loc) => {
      if (loc.id === id) {
        return { ...loc, isSelected: !loc.isSelected };
      }
      return loc;
    });
    setLocations(updatedLocations);
    const selected = updatedLocations.filter((loc) => loc.isSelected);
    setTotal(selected.reduce((sum, loc) => sum + loc.price, 0));
  };

  const isLocationSelected = (id: string) => {
    return locations.some((loc) => loc.id === id && loc.isSelected);
  };

  const handleSaveSubscription = async () => {
    if (!user) return;

    const subscriptionLocations: SubscriptionLocation[] = locations
      .filter((loc) => loc.isSelected)
      .map((loc) => ({
        id: loc.id,
        name: loc.name,
        price: loc.price,
      }));

    if (subscriptionLocations.length === 0) {
      toast.error("Please select at least one location to subscribe.");
      return;
    }

    try {
      await updateUserData({ ...user, subscriptionLocations });
      toast.success("Subscription updated successfully!");
      // Optionally refresh user data here if needed
    } catch (error) {
      toast.error("Failed to update subscription");
      console.error("Subscription update error:", error);
    }
  };

  const handleProceedToCheckout = () => {
    const selected = locations.filter((loc) => loc.isSelected);
    if (selected.length === 0) {
      toast.error("Please select at least one location");
      return;
    }
    navigate("/subscription/checkout");
  };

  const handleSkip = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      if (user) {
        await updateUserData({ ...user, subscriptionLocations: [] });
        toast.success("Skipped subscription successfully");
        navigate("/dashboard");
      } else {
        toast.error("No authenticated user");
      }
    } catch (error) {
      toast.error("Failed to skip subscription");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <Building className="h-12 w-12 text-accent mx-auto" />
          <h1 className="mt-4 text-3xl font-bold text-neutral-900">
            Choose Your Subscription
          </h1>
          <p className="mt-2 text-lg text-neutral-600">
            Select the locations you want to access properties in
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {locations.map((location) => (
            <div
              key={location.id}
              className={`cursor-pointer transition-all ${
                isLocationSelected(location.id)
                  ? "border-2 border-accent shadow-md rounded-lg"
                  : "hover:shadow-md rounded-lg"
              }`}
              onClick={() => toggleLocation(location.id)}
            >
              <Card
                className={`${
                  isLocationSelected(location.id)
                    ? "border-2 border-accent shadow-md"
                    : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-neutral-900">
                      {location.name}
                    </h3>
                    <p className="text-2xl font-bold text-accent mt-2">
                      {formatCurrency(location.price)}
                      <span className="text-sm text-neutral-500 font-normal">
                        {" "}
                        / month
                      </span>
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isLocationSelected(location.id)
                        ? "bg-accent text-white"
                        : "bg-neutral-200"
                    }`}
                  >
                    {isLocationSelected(location.id) ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span></span>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-success mr-2 mt-0.5" />
                    <span>Access to all properties in {location.name}</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-success mr-2 mt-0.5" />
                    <span>Filter by property type, budget, and more</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-success mr-2 mt-0.5" />
                    <span>Share property details via WhatsApp</span>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">
            Your Subscription Summary
          </h3>

          {locations.some((loc) => loc.isSelected) ? (
            <div className="space-y-4">
              {locations
                .filter((loc) => loc.isSelected)
                .map((location) => (
                  <div
                    key={location.id}
                    className="flex justify-between items-center pb-2 border-b border-neutral-200"
                  >
                    <div className="flex items-center">
                      <Building className="h-5 w-5 text-primary mr-2" />
                      <span>{location.name}</span>
                    </div>
                    <span>{formatCurrency(location.price)}</span>
                  </div>
                ))}

              <div className="flex justify-between items-center pt-2 font-bold">
                <span>Total Monthly Subscription</span>
                <span className="text-xl text-accent">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-neutral-500">
              No locations selected
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            variant="secondary"
            onClick={handleSkip}
            className="mr-4"
            disabled={!user}
          >
            Skip for now
          </Button>
          <Button
            variant="primary"
          onClick={async () => {
              if (!user) {
                toast.error("No authenticated user");
                return;
              }
              const subscriptionLocations = locations
                .filter((loc) => loc.isSelected)
                .map((loc) => ({
                  id: loc.id,
                  name: loc.name,
                  price: loc.price,
                }));

              if (subscriptionLocations.length === 0) {
                toast.error("Please select at least one location to subscribe.");
                return;
              }

              try {
                await updateUserData({ ...user, subscriptionLocations });
                toast.success("Subscription updated successfully!");
                navigate("/subscription/checkout");
              } catch (error) {
                toast.error("Failed to update subscription");
                console.error("Subscription update error:", error);
              }
            }}
            icon={<ArrowRight className="ml-1 h-5 w-5" />}
          >
            {user && user.subscriptionLocations && user.subscriptionLocations.length > 0
              ? "Update Subscription"
              : "Proceed to Checkout"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Subscription;

