
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Building, Check, Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Tabs from '../components/ui/Tabs';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
// import Checkbox from '../components/ui/Checkbox';
import { useAuth } from '../utils/authContext';
import { getResaleProperties, addResaleProperty, getRentalProperties, addRentalProperty, addAdminApproval } from '../utils/firestoreListings';

import { fetchStationsByCity } from '../utils/api';

const propertyTypes = [
  { value: '1 BHK', label: '1 BHK' },
  { value: '1.5 BHK', label: '1.5 BHK' },
  { value: '2 BHK', label: '2 BHK' },
  { value: '2.5 BHK', label: '2.5 BHK' },
  { value: '3 BHK', label: '3 BHK' },
  { value: '3.5 BHK', label: '3.5 BHK' },
  { value: '4 BHK', label: '4 BHK' },
  { value: '5 BHK', label: '5 BHK' },
];

const furnishingOptions = [
  { value: 'Unfurnished', label: 'Unfurnished' },
  { value: 'Semi-Furnished', label: 'Semi-Furnished' },
  { value: 'Fully Furnished', label: 'Fully Furnished' },
];

const parkingOptions = [
  { value: 'None', label: 'None' },
  { value: 'Open', label: 'Open' },
  { value: 'Covered', label: 'Covered' },
];

const amenitiesOptions = [
  { id: 'gym', label: 'Gym' },
  { id: 'pool', label: 'Swimming Pool' },
  { id: 'garden', label: 'Garden' },
  { id: 'clubhouse', label: 'Club House' },
  { id: 'security', label: '24x7 Security' },
  { id: 'power', label: 'Power Backup' },
  { id: 'lift', label: 'Lift' },
  { id: 'parking', label: 'Parking' },
];

const Inventory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resale');
  const [stations, setStations] = useState<string[]>([]);
  const [isLoadingStations, setIsLoadingStations] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  // Resale form
  const { 
    register: registerResale, 
    handleSubmit: handleSubmitResale, 
    formState: { errors: errorsResale },
    reset: resetResale
  } = useForm();
  
  // Rental form
  const { 
    register: registerRental, 
    handleSubmit: handleSubmitRental, 
    formState: { errors: errorsRental },
    reset: resetRental
  } = useForm();

  const handleStationChange = async (city: string) => {
    if (!city) return;
    
    setIsLoadingStations(true);
    try {
      const stationsData = await fetchStationsByCity(city);
      setStations(stationsData);
    } catch (error) {
      console.error('Error fetching stations:', error);
    } finally {
      setIsLoadingStations(false);
    }
  };

  const toggleAmenity = (amenityId: string) => {
    if (selectedAmenities.includes(amenityId)) {
      setSelectedAmenities(selectedAmenities.filter(id => id !== amenityId));
    } else {
      setSelectedAmenities([...selectedAmenities, amenityId]);
    }
  };

  const onSubmitResale = async (data: any) => {
    setIsLoading(true);
    try {
      if (!user) {
        toast.error('You must be logged in to add a property');
        return;
      }
      
      const newProperty = {
        createdAt: new Date().toISOString(),
        userId: user.id,
        status: 'Pending Approval',
        type: data.type,
        terrace: data.terrace === 'true',
        zone: data.zone,
        society: data.society,
        roadLocation: data.roadLocation,
        station: data.station,
        expectedPrice: parseInt(data.expectedPrice),
        floorNo: data.floorNo ? parseInt(data.floorNo) : undefined,
        flatNo: data.flatNo,
        cosmo: data.cosmo === 'true',
        connectedPerson: data.connectedPerson,
        // directBroker: data.directBroker,
        contactName: data.contactName,
        contactNumber: data.contactNumber,
      };

      await addResaleProperty(user.id, newProperty);
      await addAdminApproval('resale', newProperty);

      toast.success('Resale property added successfully. Awaiting approval.');
      resetResale();
    } catch (error) {
      console.error(error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitRental = async (data: any) => {
    setIsLoading(true);
    try {
      if (!user) {
        toast.error('You must be logged in to add a property');
        return;
      }
      
      const newProperty = {
        createdAt: new Date().toISOString(),
        userId: user.id,
        status: 'Pending Approval',
        type: data.type,
        terrace: data.terrace === 'true',
        zone: data.zone,
        society: data.society,
        roadLocation: data.roadLocation,
        station: data.station,
        rent: parseInt(data.rent),
        deposit: parseInt(data.deposit),
        furnishing: data.furnishing,
        buildingNo: data.buildingNo,
        floorNo: parseInt(data.floorNo),
        totalFloors: parseInt(data.totalFloors),
        wing: data.wing,
        flatNo: data.flatNo,
        landmark: data.landmark,
        propertyAge: parseInt(data.propertyAge),
        amenities: selectedAmenities,
        parking: data.parking,
        availableFrom: data.availableFrom,
        ownership: data.ownership,
        masterBed: data.masterBed === 'true',
        cosmo: data.cosmo === 'true',
        connectedPerson: data.connectedPerson,
        // directBroker: data.directBroker,
        contactName: data.contactName,
        contactNumber: data.contactNumber,
        propertyId: data.propertyId,
      };

      await addRentalProperty(user.id, newProperty);
      await addAdminApproval('rental', newProperty);

      toast.success('Rental property added successfully. Awaiting approval.');
      resetRental();
      setSelectedAmenities([]);
    } catch (error) {
      console.error(error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // View for listing all properties
  const [inventory, setInventory] = useState<{ resale: any[]; rental: any[] }>({ resale: [], rental: [] });
  const [showPropertyList, setShowPropertyList] = useState(true);

  const fetchInventory = useCallback(async () => {
    if (!user) return;
    try {
      const resale = await getResaleProperties(user.id);
      const rental = await getRentalProperties(user.id);
      setInventory({ resale, rental });
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  }, [user]);

  const toggleView = () => {
    if (!showPropertyList) {
      fetchInventory();
    }
    setShowPropertyList(!showPropertyList);
  };

  // Fetch inventory on component mount
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">My Inventory</h1>
            <p className="text-neutral-500">Manage your property listings</p>
          </div>
          
          <Button 
            variant={showPropertyList ? 'primary' : 'outline'}
            icon={showPropertyList ? <Plus className="h-4 w-4 mr-1" /> : <Building className="h-4 w-4 mr-1" />}
            onClick={toggleView}
          >
            {showPropertyList ? 'Add New Property' : 'View My Properties'}
          </Button>
        </div>
        
        {showPropertyList ? (
          // Property Listing View
          <Card>
            <Tabs
              tabs={[
                {
                  id: 'resale',
                  label: 'Resale Properties',
                  content: (
                    <div className="overflow-x-auto">
                      {inventory.resale.length === 0 ? (
                        <div className="text-center py-8">
                          <Building className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                          <p className="text-neutral-500">No resale properties added yet</p>
                        </div>
                      ) : (
                        <table className="min-w-full divide-y divide-neutral-200">
                          <thead>
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Type</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Society</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Location</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Price</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-neutral-200">
                            {inventory.resale.map((property: any) => (
                              <tr key={property.id} className="hover:bg-neutral-50">
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-500">
                                  {format(new Date(property.createdAt), 'dd/MM/yyyy')}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${property.status === 'Approved' ? 'bg-success/10 text-success' : 
                                      property.status === 'Rejected' ? 'bg-error/10 text-error' : 
                                      'bg-warning/10 text-warning'}`}>
                                    {property.status}
                                  </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">{property.type}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">{property.society}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">{property.roadLocation}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                                  ₹{property.expectedPrice.toLocaleString('en-IN')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  ),
                },
                {
                  id: 'rental',
                  label: 'Rental Properties',
                  content: (
                    <div className="overflow-x-auto">
                      {inventory.rental.length === 0 ? (
                        <div className="text-center py-8">
                          <Building className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                          <p className="text-neutral-500">No rental properties added yet</p>
                        </div>
                      ) : (
                        <table className="min-w-full divide-y divide-neutral-200">
                          <thead>
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Type</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Society</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Location</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Rent</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Deposit</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-neutral-200">
                            {inventory.rental.map((property: any) => (
                              <tr key={property.id} className="hover:bg-neutral-50">
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-500">
                                  {format(new Date(property.createdAt), 'dd/MM/yyyy')}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${property.status === 'Approved' ? 'bg-success/10 text-success' : 
                                      property.status === 'Rejected' ? 'bg-error/10 text-error' : 
                                      'bg-warning/10 text-warning'}`}>
                                    {property.status}
                                  </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">{property.type}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">{property.society}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">{property.roadLocation}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                                  ₹{property.rent.toLocaleString('en-IN')}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                  ₹{property.deposit.toLocaleString('en-IN')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        ) : (
          // Property Add Form View
          <Card>
            <Tabs
              tabs={[
                {
                  id: 'resale',
                  label: 'Add Resale Property',
                  content: (
                    <form onSubmit={handleSubmitResale(onSubmitResale)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                          id="type"
                          label="Type"
                          options={propertyTypes}
                          error={errorsResale.type?.message as string}
                          {...registerResale('type', { required: 'Type is required' })}
                        />
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">Terrace/Gallery</label>
                          <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                              <input 
                                type="radio" 
                                value="true" 
                                {...registerResale('terrace', { required: 'Please select an option' })}
                                className="h-4 w-4 text-primary focus:ring-primary border-neutral-300"
                              />
                              <span className="ml-2">Yes</span>
                            </label>
                            <label className="inline-flex items-center">
                              <input 
                                type="radio" 
                                value="false" 
                                {...registerResale('terrace', { required: 'Please select an option' })}
                                className="h-4 w-4 text-primary focus:ring-primary border-neutral-300"
                              />
                              <span className="ml-2">No</span>
                            </label>
                          </div>
                          {errorsResale.terrace && (
                            <p className="mt-1 text-sm text-error">{errorsResale.terrace.message as string}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          id="zone"
                          label="Zone"
                          error={errorsResale.zone?.message as string}
                          {...registerResale('zone', { required: 'Zone is required' })}
                        />
                        
                        <Input
                          id="society"
                          label="Society"
                          error={errorsResale.society?.message as string}
                          {...registerResale('society', { required: 'Society is required' })}
                        />
                        
                        <Input
                          id="roadLocation"
                          label="Road/Location"
                          error={errorsResale.roadLocation?.message as string}
                          {...registerResale('roadLocation', { required: 'Road/Location is required' })}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          id="station"
                          label="Station"
                          error={errorsResale.station?.message as string}
                          {...registerResale('station', { required: 'Station is required' })}
                        />
                        
                        <Input
                          id="expectedPrice"
                          label="Expected Price"
                          type="number"
                          error={errorsResale.expectedPrice?.message as string}
                          {...registerResale('expectedPrice', { 
                            required: 'Expected Price is required',
                            min: { 
                              value: 1, 
                              message: 'Price must be greater than 0' 
                            }
                          })}
                        />
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">Cosmo</label>
                          <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                              <input 
                                type="radio" 
                                value="true" 
                                {...registerResale('cosmo', { required: 'Please select an option' })}
                                className="h-4 w-4 text-primary focus:ring-primary border-neutral-300"
                              />
                              <span className="ml-2">Yes</span>
                            </label>
                            <label className="inline-flex items-center">
                              <input 
                                type="radio" 
                                value="false" 
                                {...registerResale('cosmo', { required: 'Please select an option' })}
                                className="h-4 w-4 text-primary focus:ring-primary border-neutral-300"
                              />
                              <span className="ml-2">No</span>
                            </label>
                          </div>
                          {errorsResale.cosmo && (
                            <p className="mt-1 text-sm text-error">{errorsResale.cosmo.message as string}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          id="floorNo"
                          label="Floor No"
                          type="number"
                          error={errorsResale.floorNo?.message as string}
                          {...registerResale('floorNo')}
                        />
                        
                        <Input
                          id="flatNo"
                          label="Flat No"
                          error={errorsResale.flatNo?.message as string}
                          {...registerResale('flatNo')}
                        />
                        
                        <Input
                          id="connectedPerson"
                          label="Connected Person"
                          error={errorsResale.connectedPerson?.message as string}
                          {...registerResale('connectedPerson', { required: 'Connected person is required' })}
                        />
                      </div>
                      
                      {/*   */}
                      
                      <div className="pt-4">
                        <Button
                          type="submit"
                          variant="primary"
                          isLoading={isLoading}
                        >
                          Submit Property
                        </Button>
                      </div>
                    </form>
                  ),
                },
                {
                  id: 'rental',
                  label: 'Add Rental Property',
                  content: (
                    <form onSubmit={handleSubmitRental(onSubmitRental)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Select
                          id="type"
                          label="Type"
                          options={propertyTypes}
                          error={errorsRental.type?.message as string}
                          {...registerRental('type', { required: 'Type is required' })}
                        />
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">Terrace/Gallery</label>
                          <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                              <input 
                                type="radio" 
                                value="true" 
                                {...registerRental('terrace', { required: 'Please select an option' })}
                                className="h-4 w-4 text-primary focus:ring-primary border-neutral-300"
                              />
                              <span className="ml-2">Yes</span>
                            </label>
                            <label className="inline-flex items-center">
                              <input 
                                type="radio" 
                                value="false" 
                                {...registerRental('terrace', { required: 'Please select an option' })}
                                className="h-4 w-4 text-primary focus:ring-primary border-neutral-300"
                              />
                              <span className="ml-2">No</span>
                            </label>
                          </div>
                          {errorsRental.terrace && (
                            <p className="mt-1 text-sm text-error">{errorsRental.terrace.message as string}</p>
                          )}
                        </div>
                        
                        <Input
                          id="zone"
                          label="Zone"
                          error={errorsRental.zone?.message as string}
                          {...registerRental('zone', { required: 'Zone is required' })}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          id="society"
                          label="Society"
                          error={errorsRental.society?.message as string}
                          {...registerRental('society', { required: 'Society is required' })}
                        />
                        
                        <Input
                          id="rent"
                          label="Rent"
                          type="number"
                          error={errorsRental.rent?.message as string}
                          {...registerRental('rent', { 
                            required: 'Rent is required',
                            min: { 
                              value: 1, 
                              message: 'Rent must be greater than 0' 
                            }
                          })}
                        />
                        
                        <Input
                          id="deposit"
                          label="Deposit"
                          type="number"
                          error={errorsRental.deposit?.message as string}
                          {...registerRental('deposit', { 
                            required: 'Deposit is required',
                            min: { 
                              value: 1, 
                              message: 'Deposit must be greater than 0' 
                            }
                          })}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Select
                          id="furnishing"
                          label="Furnishing"
                          options={furnishingOptions}
                          error={errorsRental.furnishing?.message as string}
                          {...registerRental('furnishing', { required: 'Furnishing is required' })}
                        />
                        
                        <Input
                          id="buildingNo"
                          label="Building No."
                          error={errorsRental.buildingNo?.message as string}
                          {...registerRental('buildingNo')}
                        />
                        
                        <Input
                          id="floorNo"
                          label="Floor No."
                          type="number"
                          error={errorsRental.floorNo?.message as string}
                          {...registerRental('floorNo', { required: 'Floor No. is required' })}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          id="totalFloors"
                          label="Total Floors"
                          type="number"
                          error={errorsRental.totalFloors?.message as string}
                          {...registerRental('totalFloors', { required: 'Total Floors is required' })}
                        />
                        
                        <Input
                          id="wing"
                          label="Wing"
                          error={errorsRental.wing?.message as string}
                          {...registerRental('wing')}
                        />
                        
                        <Input
                          id="flatNo"
                          label="Flat No."
                          error={errorsRental.flatNo?.message as string}
                          {...registerRental('flatNo', { required: 'Flat No. is required' })}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          id="roadLocation"
                          label="Road/Location"
                          error={errorsRental.roadLocation?.message as string}
                          {...registerRental('roadLocation', { required: 'Road/Location is required' })}
                        />
                        
                        <Input
                          id="landmark"
                          label="Landmark"
                          error={errorsRental.landmark?.message as string}
                          {...registerRental('landmark')}
                        />
                        
                        <Input
                          id="station"
                          label="Station"
                          error={errorsRental.station?.message as string}
                          {...registerRental('station', { required: 'Station is required' })}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          id="propertyAge"
                          label="Property Age (years)"
                          type="number"
                          error={errorsRental.propertyAge?.message as string}
                          {...registerRental('propertyAge', { required: 'Property Age is required' })}
                        />
                        
                        <Select
                          id="parking"
                          label="Parking"
                          options={parkingOptions}
                          error={errorsRental.parking?.message as string}
                          {...registerRental('parking', { required: 'Parking is required' })}
                        />
                        
                        <Input
                          id="availableFrom"
                          label="Available From"
                          type="date"
                          error={errorsRental.availableFrom?.message as string}
                          {...registerRental('availableFrom', { required: 'Availability Date is required' })}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          id="ownership"
                          label="Ownership"
                          error={errorsRental.ownership?.message as string}
                          {...registerRental('ownership', { required: 'Ownership is required' })}
                        />
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">Master Bedroom</label>
                          <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                              <input 
                                type="radio" 
                                value="true" 
                                {...registerRental('masterBed', { required: 'Please select an option' })}
                                className="h-4 w-4 text-primary focus:ring-primary border-neutral-300"
                              />
                              <span className="ml-2">Yes</span>
                            </label>
                            <label className="inline-flex items-center">
                              <input 
                                type="radio" 
                                value="false" 
                                {...registerRental('masterBed', { required: 'Please select an option' })}
                                className="h-4 w-4 text-primary focus:ring-primary border-neutral-300"
                              />
                              <span className="ml-2">No</span>
                            </label>
                          </div>
                          {errorsRental.masterBed && (
                            <p className="mt-1 text-sm text-error">{errorsRental.masterBed.message as string}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">Cosmo</label>
                          <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                              <input 
                                type="radio" 
                                value="true" 
                                {...registerRental('cosmo', { required: 'Please select an option' })}
                                className="h-4 w-4 text-primary focus:ring-primary border-neutral-300"
                              />
                              <span className="ml-2">Yes</span>
                            </label>
                            <label className="inline-flex items-center">
                              <input 
                                type="radio" 
                                value="false" 
                                {...registerRental('cosmo', { required: 'Please select an option' })}
                                className="h-4 w-4 text-primary focus:ring-primary border-neutral-300"
                              />
                              <span className="ml-2">No</span>
                            </label>
                          </div>
                          {errorsRental.cosmo && (
                            <p className="mt-1 text-sm text-error">{errorsRental.cosmo.message as string}</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Amenities
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {amenitiesOptions.map((amenity) => (
                            <div 
                              key={amenity.id}
                              className={`border rounded-md p-3 cursor-pointer transition-colors ${
                                selectedAmenities.includes(amenity.id) 
                                  ? 'border-primary bg-primary/5' 
                                  : 'border-neutral-200 hover:border-neutral-300'
                              }`}
                              onClick={() => toggleAmenity(amenity.id)}
                            >
                              <div className="flex items-center">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                  selectedAmenities.includes(amenity.id) 
                                    ? 'bg-primary border-primary' 
                                    : 'border-neutral-300'
                                }`}>
                                  {selectedAmenities.includes(amenity.id) && (
                                    <Check className="h-3 w-3 text-white" />
                                  )}
                                </div>
                                <span className="ml-2 text-sm">{amenity.label}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          id="connectedPerson"
                          label="Connected Person"
                          error={errorsRental.connectedPerson?.message as string}
                          {...registerRental('connectedPerson', { required: 'Connected person is required' })}
                        />
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">Direct/Broker</label>
                          <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                              <input 
                                type="radio" 
                                value="Direct" 
                                {...registerRental('directBroker', { required: 'Please select an option' })}
                                className="h-4 w-4 text-primary focus:ring-primary border-neutral-300"
                              />
                              <span className="ml-2">Direct</span>
                            </label>
                            <label className="inline-flex items-center">
                              <input 
                                type="radio" 
                                value="Broker" 
                                {...registerRental('directBroker', { required: 'Please select an option' })}
                                className="h-4 w-4 text-primary focus:ring-primary border-neutral-300"
                              />
                              <span className="ml-2">Broker</span>
                            </label>
                          </div>
                          {errorsRental.directBroker && (
                            <p className="mt-1 text-sm text-error">{errorsRental.directBroker.message as string}</p>
                          )}
                        </div>
                        
                        <Input
                          id="propertyId"
                          label="Property ID (Optional)"
                          error={errorsRental.propertyId?.message as string}
                          {...registerRental('propertyId')}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          id="contactName"
                          label="Contact Name"
                          error={errorsRental.contactName?.message as string}
                          {...registerRental('contactName', { required: 'Contact name is required' })}
                        />
                        
                        <Input
                          id="contactNumber"
                          label="Contact Number"
                          error={errorsRental.contactNumber?.message as string}
                          {...registerRental('contactNumber', { 
                            required: 'Contact number is required',
                            pattern: {
                              value: /^[0-9]{10}$/,
                              message: 'Please enter a valid 10-digit phone number'
                            }
                          })}
                        />
                      </div>
                      
                      <div className="pt-4">
                        <Button
                          type="submit"
                          variant="primary"
                          isLoading={isLoading}
                        >
                          Submit Property
                        </Button>
                      </div>
                    </form>
                  ),
                },
              ]}
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default Inventory;