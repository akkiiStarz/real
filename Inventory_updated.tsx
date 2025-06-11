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
      
      if (!data.contactName || data.contactName.trim() === '') {
        toast.error('Contact name is required');
        setIsLoading(false);
        return;
      }
      
      if (!data.contactNumber || !/^[0-9]{10}$/.test(data.contactNumber)) {
        toast.error('Please enter a valid 10-digit contact number');
        setIsLoading(false);
        return;
      }
      
