import { collection, addDoc, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

export const addResaleProperty = async (userId: string, property: any) => {
  const resaleCollection = collection(db, "users", userId, "resaleProperties");
  const docRef = await addDoc(resaleCollection, { ...property, userId });
  return docRef.id;
};

export const addRentalProperty = async (userId: string, property: any) => {
  const rentalCollection = collection(db, "users", userId, "rentalProperties");
  const docRef = await addDoc(rentalCollection, { ...property, userId });
  return docRef.id;
};

export const updatePropertyStatus = async (
  userId: string,
  category: "resale" | "rental",
  propertyId: string,
  status: string,
  isApproved?: boolean
) => {
  const propertyRef = doc(db, "users", userId, category === "resale" ? "resaleProperties" : "rentalProperties", propertyId);
  const updateData: any = { status };
  if (typeof isApproved === "boolean") {
    updateData.isApproved = isApproved;
  }
  await updateDoc(propertyRef, updateData);
};

// New function to add property to adminApprovals collection for admin review
export const addAdminApproval = async (category: "resale" | "rental", property: any) => {
  const adminApprovalsCollection = collection(db, "adminApprovals");
  const docRef = await addDoc(adminApprovalsCollection, {
    ...property,
    category,
    createdAt: property.createdAt || new Date().toISOString(),
  });
  return docRef.id;
};

export const getUsers = async (): Promise<any[]> => {
  const usersCollection = collection(db, "users");
  const querySnapshot = await getDocs(usersCollection);
  const users: any[] = [];
  querySnapshot.forEach((doc) => {
    users.push({ id: doc.id, ...doc.data() });
  });
  return users;
};

export const getResaleProperties = async (userId: string): Promise<any[]> => {
  const resaleCollection = collection(db, "users", userId, "resaleProperties");
  const querySnapshot = await getDocs(resaleCollection);
  const properties: any[] = [];
  querySnapshot.forEach((doc) => {
    properties.push({ id: doc.id, ...doc.data() });
  });
  return properties;
};

export const getRentalProperties = async (userId: string): Promise<any[]> => {
  const rentalCollection = collection(db, "users", userId, "rentalProperties");
  const querySnapshot = await getDocs(rentalCollection);
  const properties: any[] = [];
  querySnapshot.forEach((doc) => {
    properties.push({ id: doc.id, ...doc.data() });
  });
  return properties;
};

export const getResalePropertiesByLocations = async (locations: string[]): Promise<any[]> => {
  const usersCollection = collection(db, "users");
  const usersSnapshot = await getDocs(usersCollection);
  const results: any[] = [];

  // Chunk locations into groups of 10 for Firestore "in" query limit
  const chunkArray = (arr: string[], size: number) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const locationChunks = chunkArray(locations, 10);

  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;
    const resaleCollection = collection(db, "users", userId, "resaleProperties");

    for (const chunk of locationChunks) {
      const q = query(resaleCollection, where("roadLocation", "in", chunk));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
    }
  }
  return results;
};

export const getRentalPropertiesByLocations = async (locations: string[]): Promise<any[]> => {
  const usersCollection = collection(db, "users");
  const usersSnapshot = await getDocs(usersCollection);
  const results: any[] = [];

  // Chunk locations into groups of 10 for Firestore "in" query limit
  const chunkArray = (arr: string[], size: number) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const locationChunks = chunkArray(locations, 10);

  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;
    const rentalCollection = collection(db, "users", userId, "rentalProperties");

    for (const chunk of locationChunks) {
      const q = query(rentalCollection, where("roadLocation", "in", chunk));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
    }
  }
  return results;
};
