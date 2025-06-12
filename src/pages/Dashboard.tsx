import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building,
  Filter,
  Search,
  MapPin,
  X,
  CheckCheck,
  Share2,
} from "lucide-react";
import { useAuth } from "../utils/authContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Tabs from "../components/ui/Tabs";
// Removed unused import Tooltip from react-tooltip
import {
  fetchStationsByCity,
  fetchLocalitiesByCity,
  fetchBanners,
} from "../utils/api";
import {
  getUsers,
  getResaleProperties,
  getRentalProperties,
} from "../utils/firestoreListings";
import { generateWhatsAppText } from "../utils/helper";
import { PropertyCategory } from "../types";

const bhkOptions = [
  { value: "1 BHK", label: "1 BHK" },
  { value: "1.5 BHK", label: "1.5 BHK" },
  { value: "2 BHK", label: "2 BHK" },
  { value: "2.5 BHK", label: "2.5 BHK" },
  { value: "3 BHK", label: "3 BHK" },
  { value: "3.5 BHK", label: "3.5 BHK" },
  { value: "4 BHK", label: "4 BHK" },
  { value: "5 BHK", label: "5 BHK" },
];

const locationOptions = [
  { value: "Mira Road", label: "Mira Road" },
  { value: "Mira-Bhayandar", label: "Mira-Bhayandar" },
  { value: "Bhayandar", label: "Bhayandar" },
];

interface SubscriptionLocation {
  name: string;
}
interface User {
  id: string;
  isAdmin?: boolean;
  subscriptionLocations?: SubscriptionLocation[];
  fullName?: string;
  phone?: string;
}
interface ResaleProperty {
  id: string;
  status: string;
  userListingState?: string;
  userId?: string;
  society?: string | number;
  roadLocation?: string;
  expectedPrice?: number;
  floorNo?: string | number;
  flatNo?: string | number;
  contactName?: string;
  contactNumber?: string;
  type?: string;
  station?: string;
  cosmo?: boolean;
  rent?: number;
  deposit?: number;
  directBroker?: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [propertyCategory, setPropertyCategory] =
    useState<PropertyCategory>("Resale");
  const [inventory, setInventory] = useState<{ resale: ResaleProperty[]; rental: ResaleProperty[] }>({
    resale: [],
    rental: [],
  });

  // Automatically switch propertyCategory to Rental if no resale properties but rental properties exist
  useEffect(() => {
    if (inventory.resale.length === 0 && inventory.rental.length > 0) {
      setPropertyCategory("Rental");
    }
  }, [inventory]);
  const [filteredProperties, setFilteredProperties] = useState<ResaleProperty[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<ResaleProperty[]>([]);
  const [hasFiltered, setHasFiltered] = useState(false);
  const [banners, setBanners] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    bhkType: "",
    station: "",
    minBudget: "",
    maxBudget: "",
    subLocation: "",
    lookingForCosmo: undefined as boolean | undefined,
  });
  const [showFilters, setShowFilters] = useState(false);

  // WhatsApp fields
  const [receiverPrefix, setReceiverPrefix] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverWhatsApp, setReceiverWhatsApp] = useState("");

  const navigate = useNavigate();

  const fetchData = async () => {
    if (!user) return;
    const subscriptionLocs = (user.subscriptionLocations || [])
      .map(loc => loc.name.trim().toLowerCase())
      .filter(Boolean);

    try {
      const allUsers = await getUsers();
      let allResale: ResaleProperty[] = [];
      let allRental: ResaleProperty[] = [];
      for (const u of allUsers) {
        const resale: ResaleProperty[] = await getResaleProperties(u.id);
        allResale = allResale.concat(resale);
        // Assuming a similar function getRentalProperties exists
        if (typeof getRentalProperties === "function") {
          const rental: ResaleProperty[] = await getRentalProperties(u.id);
          allRental = allRental.concat(rental);
        }
      }

      const matchingResale: ResaleProperty[] = allResale.filter(
        (p: ResaleProperty) =>
          p.status === "Approved" &&
          subscriptionLocs.includes((p.roadLocation || "").trim().toLowerCase())
      );

      const matchingRental: ResaleProperty[] = allRental.filter(
        (p: ResaleProperty) =>
          p.status === "Approved" &&
          subscriptionLocs.includes((p.roadLocation || "").trim().toLowerCase())
      );

      console.log("Fetched resale properties:", matchingResale);
      console.log("Fetched rental properties:", matchingRental);

      setInventory({ resale: matchingResale, rental: matchingRental });
      setFilteredProperties([]); // Don't show any listings by default
      setHasFiltered(false);     // User must apply filters to see listings
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const loadBanners = async () => {
      try {
        const locations = user.isAdmin
          ? []
          : (user.subscriptionLocations || []).map((loc) => loc.name);
        if (!user.isAdmin && locations.length === 0) return;
        const data = await fetchBanners(locations);
        if (isMounted) setBanners(data);
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };

    fetchData();
    loadBanners();

    const intervalId = setInterval(() => {
      fetchData();
    }, 60000); // Refresh every 60 seconds

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [user]);

  // (Remove everything from this first return statement up to the next return statement.)
  // The correct code starts from the second return statement below.

  const handleFilterChange = (name: string, value: string | number | boolean | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = (
    ignoreSubscriptionFilter = false,
    currentFilters = filters
  ) => {
    if (!user) return;
    const properties =
      propertyCategory === "Rental" ? inventory.rental : inventory.resale;
    const filtered = properties.filter((property: ResaleProperty) => {
      // Hide properties with listingState "Hold" or "Sold Out"
      if (
        property.listingState === "Hold" ||
        property.listingState === "Sold Out"
      ) {
        return false;
      }
      if (!ignoreSubscriptionFilter && !user.isAdmin) {
        const hasSubscriptionForLocation = (
          user.subscriptionLocations || []
        ).some((loc) =>
          loc.name.trim().toLowerCase() ===
          (property.roadLocation || "").trim().toLowerCase()
        );
        const isOwnProperty = property.userId === user.id;
        if (!hasSubscriptionForLocation && !isOwnProperty) {
          return false;
        }
      }
      if (currentFilters.bhkType && property.type !== currentFilters.bhkType) {
        return false;
      }
      if (currentFilters.station) {
        const filterStr = currentFilters.station.trim().toLowerCase();
        const stationStr = (property.station || "").trim().toLowerCase();
        if (!stationStr.includes(filterStr)) return false;
      }
      if (propertyCategory === "Rental") {
        if (
          currentFilters.minBudget &&
          Number(currentFilters.minBudget) > 0 &&
          (property.rent ?? 0) < Number(currentFilters.minBudget)
        ) {
          return false;
        }
        if (
          currentFilters.maxBudget &&
          Number(currentFilters.maxBudget) > 0 &&
          (property.rent ?? 0) > Number(currentFilters.maxBudget)
        ) {
          return false;
        }
      }
      if (propertyCategory === "Resale") {
        if (
          currentFilters.minBudget &&
          Number(currentFilters.minBudget) > 0 &&
          (property.expectedPrice ?? 0) < Number(currentFilters.minBudget)
        ) {
          return false;
        }
        if (
          currentFilters.maxBudget &&
          Number(currentFilters.maxBudget) > 0 &&
          (property.expectedPrice ?? 0) > Number(currentFilters.maxBudget)
        ) {
          return false;
        }
      }
      if (
        currentFilters.subLocation &&
        (property.roadLocation || "").trim().toLowerCase() !==
          currentFilters.subLocation.trim().toLowerCase()
      ) {
        return false;
      }
      if (
        currentFilters.lookingForCosmo !== undefined &&
        property.cosmo !== currentFilters.lookingForCosmo
      ) {
        return false;
      }
      return true;
    });
    setFilteredProperties(filtered);
    setHasFiltered(true);
  };

  useEffect(() => {
    if (!user) return;
    if ((user.subscriptionLocations || []).length === 0 && !user.isAdmin) {
      setFilteredProperties([]);
      setHasFiltered(false);
      return;
    }
    applyFilters(false);
    // eslint-disable-next-line
  }, [user?.subscriptionLocations, propertyCategory, inventory]);

  const resetFilters = () => {
    setFilters({
      bhkType: "",
      station: "",
      minBudget: "",
      maxBudget: "",
      subLocation: "",
      lookingForCosmo: undefined,
    });
    setFilteredProperties([]);
    setHasFiltered(false);
    setSelectedProperties([]);
  };

  const togglePropertySelection = (property: ResaleProperty) => {
    if (selectedProperties.some((p) => p.id === property.id)) {
      setSelectedProperties(
        selectedProperties.filter((p) => p.id !== property.id)
      );
    } else {
      setSelectedProperties([...selectedProperties, property]);
    }
  };

  const isPropertySelected = (id: string) => {
    return selectedProperties.some((p) => p.id === id);
  };

  // WhatsApp send handler for sidebar
  const sendWhatsAppToInput = () => {
    if (!receiverName.trim() || !receiverWhatsApp.trim()) {
      alert("Please enter both name and WhatsApp number.");
      return;
    }
    if (selectedProperties.length === 0) {
      alert("Please select at least one property.");
      return;
    }
    const text = generateWhatsAppText(
      selectedProperties,
      receiverPrefix,
      receiverName,
      receiverWhatsApp
    );
    const phoneNumber = receiverWhatsApp.replace(/\D/g, "");
    const encodedText = encodeURIComponent(text);
    // This opens WhatsApp Web with the message and number
    window.open(`https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedText}`, "_blank");
  };

  const shareOnWhatsApp = () => {
    if (selectedProperties.length === 0) return;
    const text = generateWhatsAppText(
      selectedProperties,
      user?.fullName || "Real Estate Broker",
      user?.phone || "9876543210"
    );
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Banner Carousel */}
      {banners.length > 0 && (
        <div className="bg-white border-b border-neutral-200 py-4">
          <div className="container mx-auto px-4">
            <div className="overflow-x-auto">
              <div className="flex space-x-4 py-2">
                {banners.map((banner) => (
                  <div
                    key={banner.id}
                    className="flex-shrink-0 w-64 h-32 relative rounded-lg overflow-hidden shadow-sm"
                  >
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3">
                      <h3 className="text-white font-semibold text-sm">
                        {banner.title}
                      </h3>
                      <div className="flex items-center text-white/80 text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{banner.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">
              Property Dashboard
            </h1>
            <p className="text-neutral-500">
              Find and manage properties across your subscribed locations
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              variant="outline"
              icon={<Filter className="h-4 w-4 mr-1" />}
              className="md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
            {user?.isAdmin && (
              <Link to="/inventory">
                <Button variant="primary">Add New Property</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Chrome-style Tabs just below heading */}
        <div className="mb-4">
        <div className="relative" onMouseLeave={() => {
          const tooltip = document.getElementById("coming-soon-tooltip");
          if (tooltip) {
            tooltip.style.opacity = "0";
            tooltip.style.pointerEvents = "none";
          }
        }}>
          <Tabs
            variant="chrome"
            tabs={[
              { id: "residential", label: "Residential", content: null },
              { id: "commercial", label: "Commercial", content: null, disabled: true },
              { id: "shops", label: "Shops", content: null, disabled: true },
              { id: "bungalow", label: "Bungalow", content: null, disabled: true },
              { id: "rawhouse", label: "Raw House", content: null, disabled: true },
              { id: "villa", label: "Villa", content: null, disabled: true },
              { id: "penthouse", label: "Pent House", content: null, disabled: true },
              { id: "plot", label: "Plot", content: null, disabled: true },
            ]}
            defaultTab="residential"
            className="mb-2"
            onTabHover={(tabId: string) => {
              const tooltip = document.getElementById("coming-soon-tooltip");
              if (!tooltip) return;
              if (tabId !== "residential") {
                tooltip.style.opacity = "1";
                tooltip.style.pointerEvents = "auto";
              } else {
                tooltip.style.opacity = "0";
                tooltip.style.pointerEvents = "none";
              }
            }}
          />
          <div className="absolute top-full left-0 mt-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 pointer-events-none transition-opacity duration-200" id="coming-soon-tooltip">
            Coming Soon
          </div>
        </div>
        </div>

        {/* Property Category toggle just below Tabs */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Property Category
          </label>
          <div className="flex border border-neutral-300 rounded-md overflow-hidden w-full max-w-xs">
            <button
              className={`flex-1 py-2 ${
                propertyCategory === "Resale"
                  ? "bg-primary text-white"
                  : "bg-white text-neutral-700"
              }`}
              onClick={() => setPropertyCategory("Resale")}
            >
              Resale
            </button>
            <button
              className={`flex-1 py-2 ${
                propertyCategory === "Rental"
                  ? "bg-primary text-white"
                  : "bg-white text-neutral-700"
              }`}
              onClick={() => setPropertyCategory("Rental")}
            >
              Rental
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className={`lg:block ${showFilters ? "block" : "hidden"}`}>
            <Card className="sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button variant="text" size="sm" onClick={resetFilters}>
                  Reset
                </Button>
              </div>
              <div className="space-y-4">
                <Input
                  id="receiverPrefix"
                  label="Prefix (Mr)"
                  placeholder="Enter name prefix"
                  value={receiverPrefix}
                  onChange={e => setReceiverPrefix(e.target.value)}
                />
                <Input
                  id="receiverName"
                  label="Name"
                  placeholder="Enter name"
                  value={receiverName}
                  onChange={e => setReceiverName(e.target.value)}
                />
                <Input
                  id="receiverWhatsApp"
                  label="WhatsApp Number"
                  placeholder="Enter WhatsApp number"
                  value={receiverWhatsApp}
                  onChange={e => setReceiverWhatsApp(e.target.value)}
                />
                {/* <Button
                  variant="primary"
                  fullWidth
                  icon={<Share2 className="h-4 w-4 mr-1" />}
                  onClick={sendWhatsAppToInput}
                >
                  Send on WhatsApp
                </Button> */}
                <Select
                  id="bhkType"
                  label="BHK Type"
                  options={bhkOptions}
                  value={filters.bhkType}
                  onChange={(e) =>
                    handleFilterChange("bhkType", e.target.value)
                  }
                />
                <Select
                  id="station"
                  label="Station"
                  options={locationOptions}
                  value={filters.station}
                  onChange={(e) =>
                    handleFilterChange("station", e.target.value)
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="minBudget"
                    label="Min Budget"
                    value={filters.minBudget}
                    onChange={(e) =>
                      handleFilterChange("minBudget", e.target.value)
                    }
                  />
                  <Input
                    id="maxBudget"
                    label="Max Budget"
                    value={filters.maxBudget}
                    onChange={(e) =>
                      handleFilterChange("maxBudget", e.target.value)
                    }
                  />
                </div>
                <Input
                  id="subLocation"
                  label="Sub Location"
                  value={filters.subLocation}
                  onChange={(e) =>
                    handleFilterChange("subLocation", e.target.value)
                  }
                />
                <div>
                  <p className="block text-sm font-medium text-neutral-700 mb-1">
                    Looking for Cosmo?
                  </p>
                  <div className="flex space-x-4">
                    <div
                      className={`px-3 py-2 border rounded-md cursor-pointer ${
                        filters.lookingForCosmo === true
                          ? "bg-primary text-white border-primary"
                          : "border-neutral-300"
                      }`}
                      onClick={() =>
                        handleFilterChange("lookingForCosmo", true)
                      }
                    >
                      Yes
                    </div>
                    <div
                      className={`px-3 py-2 border rounded-md cursor-pointer ${
                        filters.lookingForCosmo === false
                          ? "bg-primary text-white border-primary"
                          : "border-neutral-300"
                      }`}
                      onClick={() =>
                        handleFilterChange("lookingForCosmo", false)
                      }
                    >
                      No
                    </div>
                  </div>
                </div>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => applyFilters(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {!user ||
            ((user.subscriptionLocations || []).length === 0 &&
              !user.isAdmin) ? (
              <Card>
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-neutral-800 mb-2">
                    No Active Subscriptions
                  </h2>
                  <p className="text-neutral-600 mb-4">
                    You need to subscribe to at least one location to view
                    properties.
                  </p>
                  <Link to="/subscription">
                    <Button variant="primary">Add Subscription</Button>
                  </Link>
                </div>
              </Card>
            ) : !hasFiltered ? (
              <Card>
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-neutral-800 mb-2">
                    Apply Filters to See Properties
                  </h2>
                  <p className="text-neutral-600">
                    Use the filters to narrow down your search and find the
                    perfect property.
                  </p>
                </div>
              </Card>
            ) : filteredProperties.length === 0 ? (
              <Card>
                <div className="text-center py-8">
                  <X className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-neutral-800 mb-2">
                    No Properties Found
                  </h2>
                  <p className="text-neutral-600 mb-4">
                    No properties match your current filter criteria. Try
                    adjusting your filters.
                  </p>
                  <Button variant="outline" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </div>
              </Card>
            ) : (
              <>
                {/* Action Bar */}
                {selectedProperties.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <CheckCheck className="h-5 w-5 text-primary mr-2" />
                      <span className="font-medium">
                        {selectedProperties.length} properties selected
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate("/compare", {
                            state: { selectedProperties },
                          })
                        }
                      >
                        Compare
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Share2 className="h-4 w-4 mr-1" />}
                        onClick={shareOnWhatsApp}
                      >
                        Share on WhatsApp
                      </Button>
                    </div>
                  </div>
                )}

                {/* Properties Table */}
                <Card>
                  <div className="overflow-x-auto max-w-full">
                    <table className="min-w-full divide-y divide-neutral-200 table-auto" style={{ tableLayout: 'auto', transition: 'all 0.3s ease' }}>
                          <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Select
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Sr. No
                          </th>
                          {propertyCategory === "New" && (
                            <>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Possession Date
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Building / Society
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Road / Location
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Total Package
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Brochure
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Images
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Video
                              </th>
                            </>
                          )}
                          {propertyCategory === "Resale" && (
                            <>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Direct / Broker
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Building / Society
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Road / Location
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Expected Price
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                FLR No
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                FLAT No
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Name 
                              </th>
                            </>
                          )}
                          {propertyCategory === "Rental" && (
                            <>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Direct / Broker
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Building / Society
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Road / Location
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Rent
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Deposit
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                FLAT No
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Name 
                              </th>
                            </>
                          )}
                          <th className="px-4 py-3  text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Contact
                          </th>
                        </tr>
                      </thead>

                      <tbody className="bg-white divide-y divide-neutral-200">
                        {filteredProperties.map((property, index) => {
                          const hasSubForLocation = (
                            user.subscriptionLocations || []
                          ).some(
                            (loc) =>
                              loc.name.trim().toLowerCase() ===
                              (property.roadLocation || "").trim().toLowerCase()
                          );
                          return (
                            <tr
                              key={property.id + '-' + index}
                              className={`hover:bg-neutral-50 ${
                                isPropertySelected(property.id)
                                  ? "bg-primary/5"
                                  : ""
                              }`}
                            >
                              <td className="px-4 py-4 whitespace-nowrap text-left">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                                  checked={isPropertySelected(property.id)}
                                  onChange={() =>
                                    togglePropertySelection(property)
                                  }
                                />
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-left text-sm text-neutral-500">
                                {index + 1}
                              </td>
                              {propertyCategory === "Resale" && (
                                <>
                                  <td className="px-4 py-4 whitespace-nowrap text-left text-sm font-medium text-neutral-900">
                                    {property.userId === user?.id ? "Direct" : "Broker"}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-left text-sm text-neutral-900">
                                    {property.society}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-left text-sm text-neutral-900">
                                    {property.roadLocation}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-left text-sm text-neutral-900 font-semibold">
                                    ₹
                                    {property.expectedPrice?.toLocaleString(
                                      "en-IN"
                                    )}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-left text-sm text-neutral-900">
                                    {property.floorNo || "N/A"}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-left text-sm text-neutral-900">
                                    {(user.isAdmin || property.userId === user.id || hasSubForLocation)
                                      ? property.flatNo || "N/A"
                                      : "Hidden"}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-left text-sm text-neutral-900">
                                    {property.contactName}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-neutral-900">
                                    {property.contactNumber}
                                  </td>
                                </>
                              )}
                              {propertyCategory === "Rental" && (
                                <>
                                  <td className="px-4 py-4 whitespace-nowrap text-left text-sm font-medium text-neutral-900">
                                    {property.userId === user?.id ? "Direct" : "Broker"}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-left text-sm text-neutral-900">
                                    {property.society}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-left text-sm text-neutral-900">
                                    {property.roadLocation}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-left text-sm text-neutral-900 font-semibold">
                                    ₹
                                    {property.rent
                                      ? property.rent.toLocaleString("en-IN")
                                      : "N/A"}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-left text-sm text-neutral-900">
                                    ₹
                                    {property.deposit
                                      ? property.deposit.toLocaleString("en-IN")
                                      : "N/A"}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-left text-sm text-neutral-900">
                                    {(user.isAdmin || property.userId === user.id || hasSubForLocation)
                                      ? property.flatNo || "N/A"
                                      : "Hidden"}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-left text-sm text-neutral-900">
                                    {property.contactName}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-neutral-900">
                                    {property.contactNumber}
                                  </td>
                                </>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;