import { User, SubscriptionLocation } from '../types';

// Format currency to Indian Rupees
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Calculate subscription total
export const calculateSubscriptionTotal = (locations: SubscriptionLocation[]): number => {
  return locations.reduce((total, location) => total + location.price, 0);
};

// Generate WhatsApp sharing text for properties
export const generateWhatsAppText = (
  properties: any[],
  prefix: string,
  name: string,
  phone: string,
  user?: { id: string; isAdmin?: boolean }, // Pass user info
  totalResaleCount?: number
): string => {
  const totalCount = totalResaleCount !== undefined ? totalResaleCount : properties.length;
  let text = `Hello! ${prefix ? prefix + " " : ""}${name},\n\nWe are pleased to share with you ${totalCount} resale properties that match your requirements and budget.\n\nHere are the details of the ${properties.length} selected properties:\n\n`;

  properties.forEach((property) => {
    text += `✅ ${property.society}\n`;

    const fields = [
      property.roadLocation,
      property.type,
      property.directBroker,
      // Only show floorNo and flatNo if admin or owner
      (user?.isAdmin || property.userId === user?.id) ? (property.floorNo ? `Floor No: ${property.floorNo}` : null) : null,
      (user?.isAdmin || property.userId === user?.id) ? (property.flatNo ? `Flat No: ${property.flatNo}` : null) : null,
      property.rent ? `Rent: ₹${property.rent}` : null,
      property.deposit ? `Deposit: ₹${property.deposit}` : null,
      property.expectedPrice ? `Expected Price: ₹${property.expectedPrice}` : null,
      property.contactName,
      property.contactNumber,
    ].filter(Boolean);

    text += `* - ${fields.join(', ')}\n\n`;
  });

  text += `Thank you for considering Deals4Property.\n\nBest regards,\nSudhir Gupta\n7304652722`;

  return text;
};

// Check if user has subscription for a location
export const hasLocationSubscription = (user: User | null, location: string): boolean => {
  if (!user) return false;
  return user.subscriptionLocations.some(loc => loc.name.toLowerCase() === location.toLowerCase());
};

// Helper to get user's subscribed locations as array of names
export const getUserSubscribedLocations = (user: User | null): string[] => {
  if (!user) return [];
  return user.subscriptionLocations.map(loc => loc.name);
};

// Filter properties based on criteria
export const filterProperties = (properties: any[], filters: any): any[] => {
  return properties.filter(property => {
    // Filter by BHK type if specified
    if (filters.bhkType && property.type !== filters.bhkType) {
      return false;
    }
    
    // Filter by station if specified
    if (filters.station && property.station !== filters.station) {
      return false;
    }
    
    // Filter by budget range if specified
    if (filters.minBudget && filters.propertyCategory === 'Rental' && property.rent < filters.minBudget) {
      return false;
    }
    if (filters.maxBudget && filters.propertyCategory === 'Rental' && property.rent > filters.maxBudget) {
      return false;
    }
    if (filters.minBudget && filters.propertyCategory === 'Resale' && property.expectedPrice < filters.minBudget) {
      return false;
    }
    if (filters.maxBudget && filters.propertyCategory === 'Resale' && property.expectedPrice > filters.maxBudget) {
      return false;
    }
    
    // Filter by sub-location if specified
    if (filters.subLocation && property.roadLocation !== filters.subLocation) {
      return false;
    }
    
    // Filter by Cosmo if specified
    if (filters.lookingForCosmo !== undefined && property.cosmo !== filters.lookingForCosmo) {
      return false;
    }
    
    return true;
  });
};

