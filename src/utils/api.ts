import axios from 'axios';
import { State, City, Banner } from '../types';

// API to fetch states
export const fetchStates = async (): Promise<State[]> => {
  try {
    const response = await axios.get('https://api.countrystatecity.in/v1/countries/IN/states', {
      headers: {
        'X-CSCAPI-KEY': 'QXc3MW5lbVNuVTdpWm5sVnZYOFNid0hSUjVNNnRZSVB2czFpaE5FTQ=='
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching states:', error);
    return [];
  }
};

// API to fetch cities based on state code
export const fetchCities = async (stateCode: string): Promise<City[]> => {
  try {
    const response = await axios.get(`https://api.countrystatecity.in/v1/countries/IN/states/${stateCode}/cities`, {
      headers: {
        'X-CSCAPI-KEY': 'QXc3MW5lbVNuVTdpWm5sVnZYOFNid0hSUjVNNnRZSVB2czFpaE5FTQ=='
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
};

// API to fetch banners
export const fetchBanners = async (locations: string[]): Promise<Banner[]> => {
  try {
    const locationsParam = locations.join(',');
    const response = await axios.get(
      `https://asia-south1-starzapp.cloudfunctions.net/EstatexD4P/banners?location=${encodeURIComponent(locationsParam)}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching banners:', error);
    return [];
  }
};

// Simulate station data based on city
export const fetchStationsByCity = async (city: string): Promise<string[]> => {
  // This is a mock function - in a real app, this would call an API
  const mockStations: Record<string, string[]> = {
    'Mumbai': ['Dadar', 'Andheri', 'Borivali', 'Churchgate', 'CST'],
    'Thane': ['Thane', 'Mulund', 'Kalwa', 'Airoli'],
    'Mira Road': ['Mira Road', 'Bhayander'],
    'Dahisar': ['Dahisar', 'Borivali'],
    'Bhayandar': ['Bhayander', 'Naigaon'],
    'Delhi': ['Connaught Place', 'Rajiv Chowk', 'Chandni Chowk'],
    'Bangalore': ['MG Road', 'Indiranagar', 'Whitefield'],
    'Pune': ['Shivaji Nagar', 'Hinjewadi', 'Kothrud'],
  };
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return mockStations[city] || [];
};

// Simulate localities data based on city
export const fetchLocalitiesByCity = async (city: string): Promise<string[]> => {
  // This is a mock function - in a real app, this would call an API
  const mockLocalities: Record<string, string[]> = {
    'Mumbai': ['Andheri East', 'Andheri West', 'Juhu', 'Bandra', 'Powai', 'Malad', 'Goregaon'],
    'Thane': ['Ghodbunder Road', 'Eastern Express Highway', 'Wagle Estate', 'Majiwada'],
    'Mira Road': ['Shanti Nagar', 'Pleasant Park', 'Shrishti Complex', 'Beverly Park'],
    'Dahisar': ['Anand Nagar', 'Rawalpada', 'Dahisar East', 'Dahisar West'],
    'Bhayandar': ['Bhayandar East', 'Bhayandar West', 'Navghar', 'Uttan'],
    'Delhi': ['South Delhi', 'North Delhi', 'East Delhi', 'Dwarka', 'Noida'],
    'Bangalore': ['Koramangala', 'HSR Layout', 'Jayanagar', 'JP Nagar'],
    'Pune': ['Aundh', 'Baner', 'Viman Nagar', 'Koregaon Park'],
  };
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return mockLocalities[city] || [];
};