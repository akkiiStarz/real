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
import {
  fetchStationsByCity,
  fetchLocalitiesByCity,
  fetchBanners,
} from "../utils/api";
import {
  getUsers,
  getResaleProperties,
  getRentalProperties,
  getResalePropertiesByLocations,
  getRentalPropertiesByLocations,
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

const fetchAndLogSubscribedListings = async (user) => {
  if (!user || !user.subscriptionLocations) {
    console.log("No user or no subscriptions");
    return;
  }

  // Normalize subscription locations
  const subscriptionLocs = user.subscriptionLocations
    .map((loc) => loc.name.trim().toLowerCase())
    .filter(Boolean);

  // Fetch all users
  const allUsers = await getUsers();
  let allResale = [];

  // Fetch all resale properties for all users
  for (const u of allUsers) {
    const resale = await getResaleProperties(u.id);
    allResale = allResale.concat(resale);
  }

  // Filter by approved and matching location
  const matchingResale = allResale.filter(
    (p) =>
      p.status === "Approved" &&
      subscriptionLocs.includes((p.roadLocation || "").trim().toLowerCase())
  );

  console.log("User subscription locations:", subscriptionLocs);
  console.log("All resale property locations:", allResale.map((p) => p.roadLocation));
  console.log("Matching resale listings:", matchingResale);
};

const Dashboard = () => {
  const { user } = useAuth();
  const [propertyCategory, setPropertyCategory] =
    useState<PropertyCategory>("Resale");
  const [inventory, setInventory] = useState<{ resale: any[]; rental: any[] }>({
    resale: [],
    rental: [],
  });
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<any[]>([]);
  const [hasFiltered, setHasFiltered] = useState(false);
  const [banners, setBanners] = useState<any[]>([]);
  const [stations, setStations] = useState<string[]>([]);
  const [localities, setLocalities] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    bhkType: "",
    station: "",
    minBudget: "",
    maxBudget: "",
    subLocation: "",
    lookingForCosmo: undefined as boolean | undefined,
  });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Fetch and filter listings based on subscription locations
  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Normalize subscription locations
        const subscriptionLocs = (user.subscriptionLocations || [])
          .map(loc => loc.name.trim().toLowerCase())
          .filter(Boolean);

        // Fetch all users and their resale properties
        const allUsers = await getUsers();
        let allResale: ResaleProperty[] = [];
        for (const u of allUsers) {
          const resale: ResaleProperty[] = await getResaleProperties(u.id);
          allResale = allResale.concat(resale);
        }

        // Filter by approved and matching location
        const matchingResale: ResaleProperty[] = allResale.filter(
          (p: ResaleProperty) =>
            p.status === "Approved" &&
            subscriptionLocs.includes((p.roadLocation || "").trim().toLowerCase())
        );

        // Set inventory and filteredProperties so it shows in the table
        if (isMounted) {
          setInventory({ resale: matchingResale, rental: [] }); // Only resale for now
          setFilteredProperties(matchingResale);
          setHasFiltered(true);
        }

        // Debug logs
        console.log("User subscription locations:", subscriptionLocs);
        console.log("All resale property locations:", allResale.map((p) => p.roadLocation));
        console.log("Matching resale listings:", matchingResale);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

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

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAndLogSubscribedListings(user);
    }
  }, [user]);

  const loadStationsAndLocalities = async (city: string) => {
    if (!city) return;
    const stationData = await fetchStationsByCity(city);
    setStations(stationData);
    const localitiesData = await fetchLocalitiesByCity(city);
    setLocalities(localitiesData);
  };

  const handleFilterChange = (name: string, value: any) => {
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
    const filtered = properties.filter((property: any) => {
      // Subscription location filter
      if (!ignoreSubscriptionFilter && !user.isAdmin) {
        const hasSubscriptionForLocation = (
          user.subscriptionLocations || []
        ).some((loc) => {
          // Compare normalized subscription location name with property roadLocation
          return (
            loc.name.trim().toLowerCase() ===
            (property.roadLocation || "").trim().toLowerCase()
          );
        });

        // Always show user's own properties
        const isOwnProperty = property.userId === user.id;

        if (!hasSubscriptionForLocation && !isOwnProperty) {
          return false;
        }
      }
      // BHK filter
      if (currentFilters.bhkType && property.type !== currentFilters.bhkType) {
        return false;
      }
      // Station filter
      if (currentFilters.station) {
        const filterStr = currentFilters.station.trim().toLowerCase();
        const stationWords = (property.station || "")
          .trim()
          .toLowerCase()
          .split(/\s+/);
        const match = stationWords.some((word: string) =>
          word.includes(filterStr)
        );
        if (!match) return false;
      }
      // Budget filter
      if (propertyCategory === "Rental") {
        if (
          currentFilters.minBudget &&
          Number(currentFilters.minBudget) > 0 &&
          property.rent < Number(currentFilters.minBudget)
        ) {
          return false;
        }
        if (
          currentFilters.maxBudget &&
          Number(currentFilters.maxBudget) > 0 &&
          property.rent > Number(currentFilters.maxBudget)
        ) {
          return false;
        }
      }
      if (propertyCategory === "Resale") {
        if (
          currentFilters.minBudget &&
          Number(currentFilters.minBudget) > 0 &&
          property.expectedPrice < Number(currentFilters.minBudget)
        ) {
          return false;
        }
        if (
          currentFilters.maxBudget &&
          Number(currentFilters.maxBudget) > 0 &&
          property.expectedPrice > Number(currentFilters.maxBudget)
        ) {
          return false;
        }
      }
      // Sub-location filter (normalize for comparison)
      if (
        currentFilters.subLocation &&
        (property.roadLocation || "").trim().toLowerCase() !==
          currentFilters.subLocation.trim().toLowerCase()
      ) {
        return false;
      }
      // Cosmo filter
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
    // Automatically apply filters when subscriptionLocations or inventory changes
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

  const togglePropertySelection = (property: any) => {
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
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Property Category
                  </label>
                  <div className="flex border border-neutral-300 rounded-md overflow-hidden">
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
                <Select
                  id="bhkType"
                  label="BHK Type"
                  options={bhkOptions}
                  value={filters.bhkType}
                  onChange={(e) =>
                    handleFilterChange("bhkType", e.target.value)
                  }
                />
                <Input
                  id="station"
                  label="Station"
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
                          // Determine if user has subscription for property's location
                          const hasSubForLocation = (
                            user.subscriptionLocations || []
                          ).some(
                            (loc) =>
                              loc.name.trim().toLowerCase() ===
                              (property.roadLocation || "").trim().toLowerCase()
                          );
                          return (
                            <tr
                              key={property.id}
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
                                    {property.directBroker}
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
                                  {/* Show flatNo only if user has subscription for location or it's their own property */}
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
                                    {property.directBroker}
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
                                  {/* Show flatNo only if user has subscription for location or it's their own property */}
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