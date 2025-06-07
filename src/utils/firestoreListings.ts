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
