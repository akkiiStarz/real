// User related types
export interface User {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  reraNumber: string;
  state: string;
  city: string;
  password: string;
  location: {
    lat: number;
    lng: number;
  };
  subscriptionLocations: SubscriptionLocation[];
  isAdmin?: boolean;
}

export interface SubscriptionLocation {
  id: string;
  name: string;
  price: number;
}

// Property related types
export type PropertyType = 'Residential' | 'Commercial' | 'Villa';
export type PropertyCategory = 'New' | 'Resale' | 'Rental';
export type PropertyStatus = 'Pending Approval' | 'Approved' | 'Rejected';

export interface BaseProperty {
  id: string;
  createdAt: string;
  userId: string;
  status: PropertyStatus;
  type: string; // BHK type
  terrace: boolean;
  zone: string;
  society: string;
  roadLocation: string;
  station: string;
  cosmo: boolean;
  connectedPerson: string;
  directBroker: 'Direct' | 'Broker';
  images?: string[];
  video?: string;
}

export interface ResaleProperty extends BaseProperty {
  expectedPrice: number;
  floorNo?: number;
  flatNo?: string;
  contactName?: string;
  contactNumber?: string;
}

export interface RentalProperty extends BaseProperty {
  rent: number;
  deposit: number;
  furnishing: 'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished';
  buildingNo?: string;
  floorNo: number;
  totalFloors: number;
  wing?: string;
  flatNo: string;
  landmark?: string;
  propertyAge: number;
  amenities: string[];
  parking: 'Open' | 'Covered' | 'None';
  availableFrom: string;
  ownership: string;
  masterBed: boolean;
  contactName: string;
  contactNumber: string;
  propertyId?: string;
}

// State and City types
export interface State {
  id: number;
  name: string;
  iso2: string;
}

export interface City {
  id: number;
  name: string;
}

// Banner type
export interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  location: string;
}

// Added LocationOption interface with disabled property for subscription page
export interface LocationOption {
  id: string;
  name: string;
  price: number;
  isSelected: boolean;
  disabled?: boolean;
}
