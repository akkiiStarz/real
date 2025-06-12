import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building, Check, ArrowRight, Lock } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useAuth } from "../utils/authContext";
import { formatCurrency } from "../utils/helper";
import toast from "react-hot-toast";
import { getUsers } from "../utils/firestoreListings";

interface LocationOption {
  id: string;
  name: string;
  price: number;
  isSelected: boolean;
}

const initialLocations: LocationOption[] = [
  { id: "1", name: "Mumbai", price: 1500, isSelected: false },
  { id: "2", name: "Thane", price: 1000, isSelected: false },
  { id: "3", name: "Mira road", price: 800, isSelected: false },
  { id: "4", name: "Dahisar", price: 800, isSelected: false },
  { id: "5", name: "Bhayandar", price: 800, isSelected: false },
  { id: "6", name: "Delhi", price: 1500, isSelected: false },
  { id: "7", name: "Bangalore", price: 1200, isSelected: false },
  { id: "8", name: "Pune", price: 1000, isSelected: false },
  { id: "9", name: "Kandivali", price: 1000, isSelected: false },
  { id: "10", name: "Nallasopara", price: 1000, isSelected: false },
];

const Subscription = () => {
  const navigate = useNavigate();
  const { user, updateUserData, reloadUser, loading } = useAuth();
  const [locations, setLocations] = useState<LocationOption[]>(initialLocations);
  const [total, setTotal] = useState(0);
  const [upgradeMode, setUpgradeMode] = useState(false);
  const [allSubscribedLocations, setAllSubscribedLocations] = useState<Set<string>>(new Set());

  const isLocationDisabled = (location: LocationOption) => {
    if (!user || !user.subscriptionLocations) return false;
    const sub = user.subscriptionLocations.find(
      (sub) => sub.name.toLowerCase() === location.name.toLowerCase()
    );
    if (!sub || !sub.subscribedAt) return false;
    const subscribedDate = new Date(sub.subscribedAt);
    const now = new Date();
    const diff = now.getTime() - subscribedDate.getTime();
    // Disable for 1 month (30 days)
    return diff < 30 * 24 * 60 * 60 * 1000;
  };

  const isLocationLocked = (location: LocationOption) => {
    if (!user || !user.subscriptionLocations) return true; // Locked if not subscribed
    const sub = user.subscriptionLocations.find(
      (sub) => sub.name.toLowerCase() === location.name.toLowerCase()
    );
    if (!sub) return true; // Locked if never subscribed
    if (!sub.subscribedAt) return true;
    const subscribedDate = new Date(sub.subscribedAt);
    const now = new Date();
    const diff = now.getTime() - subscribedDate.getTime();
    // Locked if subscription expired (after 1 month)
    return diff >= 30 * 24 * 60 * 60 * 1000;
  };

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

  useEffect(() => {
    const fetchAllSubscribedLocations = async () => {
      try {
        const users = await getUsers();
        const subscribedSet = new Set<string>();
        users.forEach((u) => {
          if (u.subscriptionLocations && Array.isArray(u.subscriptionLocations)) {
            u.subscriptionLocations.forEach((sub: any) => {
              if (sub.name) {
                subscribedSet.add(sub.name.toLowerCase());
              }
            });
          }
        });
        setAllSubscribedLocations(subscribedSet);
      } catch (error) {
        console.error("Failed to fetch all subscribed locations:", error);
      }
    };
    fetchAllSubscribedLocations();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!loading && !user) {
    navigate("/login");
    return null;
  }

  const toggleLocation = (id: string) => {
    const location = locations.find((loc) => loc.id === id);
    if (!location) return;
    if (isLocationDisabled(location)) {
      toast.error("You cannot change subscription for this location within 30 days.");
      return;
    }
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
          {locations.map((location) => {
            const disabled = isLocationDisabled(location);
            const locked = isLocationLocked(location);

            return (
              <div
                key={location.id}
                className={`cursor-pointer transition-all ${
                  isLocationSelected(location.id)
                    ? "border-2 border-accent shadow-md rounded-lg"
                    : "hover:shadow-md rounded-lg"
                } ${disabled ? "opacity-60 pointer-events-none" : ""} ${locked ? "opacity-80" : ""}`}
                onClick={() => {
                  if (disabled) return; // Never allow toggling disabled (active subscription)
                  // Always allow toggling locked locations (for upgrade)
                  toggleLocation(location.id);
                }}
                title={
                  disabled
                    ? "You have already subscribed to this location. It will be available after 1 month."
                    : "Click to select this location for upgrade."
                }
              >
                <Card
                  className={`${isLocationSelected(location.id)
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
                    <div className="flex items-center space-x-2">
                      {/* Locked icon */}
                      {locked && (
                        <span className="w-6 h-6 flex items-center justify-center bg-neutral-300 rounded-full">
                          <Lock className="h-4 w-4 text-neutral-600" />
                        </span>
                      )}

                      {/* Select/Check icon */}
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                          disabled
                            ? "bg-accent text-white border-accent"
                            : isLocationSelected(location.id)
                            ? "bg-accent text-white border-accent"
                            : "bg-white text-neutral-400 border-neutral-300"
                        }`}
                      >
                        {disabled || isLocationSelected(location.id) ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <span className="block w-3 h-3 rounded-full bg-transparent" />
                        )}
                      </span>
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
            );
          })}
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

        {user && user.subscriptionLocations && user.subscriptionLocations.length > 0 && !upgradeMode && (
          <div className="flex justify-end mb-4">
            <Button
              variant="primary"
              onClick={() => setUpgradeMode(true)}
            >
              Upgrade Subscription
            </Button>
          </div>
        )}

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
              // Keep previous subscriptions as is, only add new ones
              const prevSubs = user.subscriptionLocations || [];
              const newSubs = locations
                .filter((loc) => isLocationSelected(loc.id) && isLocationLocked(loc))
                .map((loc) => ({
                  id: loc.id,
                  name: loc.name.toLowerCase().trim(),
                  price: loc.price,
                  subscribedAt: new Date().toISOString(),
                }));
              const subscriptionLocations = [
                ...prevSubs.filter((sub) => isLocationDisabled(sub)), // keep disabled (active) subs
                ...newSubs, // add new
              ];

              if (subscriptionLocations.length === 0) {
                toast.error("Please select at least one location to subscribe.");
                return;
              }

              try {
                await updateUserData({ ...user, subscriptionLocations });
                await reloadUser(); // Ensures Dashboard sees new subscriptions immediately
                toast.success("Subscription updated successfully!");
                setUpgradeMode(false);

                // Refresh locations state to reflect updated subscription and disabled status
                const now = new Date();
                const updatedLocations = locations.map((loc) => {
                  const sub = subscriptionLocations.find(
                    (sub) => sub.name === loc.name
                  );
                  let isSelected = !!sub;
                  let disabled = false;
                  if (sub && sub.subscribedAt) {
                    const subscribedDate = new Date(sub.subscribedAt);
                    const diff = now.getTime() - subscribedDate.getTime();
                    // Disable for 1 month (30 days)
                    disabled = diff < 30 * 24 * 60 * 60 * 1000;
                  }
                  return {
                    ...loc,
                    isSelected,
                    // Optionally, you can add a disabled property if you want to use it in your UI
                    // disabled,
                  };
                });
                setLocations(updatedLocations);

                // Await reloadUser completion before navigating
                await new Promise((resolve) => setTimeout(resolve, 500));

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

