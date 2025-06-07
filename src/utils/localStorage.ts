import { User, ResaleProperty, RentalProperty, Banner } from '../types';

// Initialize localStorage with default values if not exists
export const initLocalStorage = (): void => {
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([]));
  }

  if (!localStorage.getItem('currentUser')) {
    localStorage.setItem('currentUser', JSON.stringify(null));
  }

  if (!localStorage.getItem('myInventory')) {
    localStorage.setItem('myInventory', JSON.stringify({
      resale: [],
      rental: []
    }));
  }
};

// User related functions
export const saveUser = (user: User): void => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem('users', JSON.stringify(users));
};

export const getUsers = (): User[] => {
  return JSON.parse(localStorage.getItem('users') || '[]');
};

export const getCurrentUser = (): User | null => {
  return JSON.parse(localStorage.getItem('currentUser') || 'null');
};

export const setCurrentUser = (user: User | null): void => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

export const updateUser = (user: User): void => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index !== -1) {
    users[index] = user;
    localStorage.setItem('users', JSON.stringify(users));
    
    // Also update current user if it's the same user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === user.id) {
      setCurrentUser(user);
    }
  }
};

// Property related functions
export const getMyInventory = () => {
  return JSON.parse(localStorage.getItem('myInventory') || '{"resale":[],"rental":[]}');
};

export const saveResaleProperty = (property: ResaleProperty): void => {
  const inventory = getMyInventory();
  inventory.resale.push(property);
  localStorage.setItem('myInventory', JSON.stringify(inventory));
};

export const saveRentalProperty = (property: RentalProperty): void => {
  const inventory = getMyInventory();
  inventory.rental.push(property);
  localStorage.setItem('myInventory', JSON.stringify(inventory));
};

export const updatePropertyStatus = (id: string, category: 'resale' | 'rental', status: string): void => {
  const inventory = getMyInventory();
  const index = inventory[category].findIndex((p: any) => p.id === id);
  if (index !== -1) {
    inventory[category][index].status = status;
    localStorage.setItem('myInventory', JSON.stringify(inventory));
  }
};

// Banner related functions
export const saveBanners = (banners: Banner[]): void => {
  localStorage.setItem('banners', JSON.stringify(banners));
};

export const getBanners = (): Banner[] => {
  return JSON.parse(localStorage.getItem('banners') || '[]');
};

// Helper function to generate unique IDs
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};