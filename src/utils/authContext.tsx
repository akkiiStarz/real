import { createContext, useContext, useState, useEffect, ReactNode, FC } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '../types';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (userData: any) => Promise<boolean>;
  updateUserData: (userData: User) => Promise<void>;
  reloadUser: () => Promise<void>;
  loading: boolean;
}
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => Promise.resolve(false),
  logout: () => {},
  signup: () => Promise.resolve(false),
  updateUserData: () => Promise.resolve(),
  reloadUser: () => Promise.resolve(),
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Always restore user from Firebase Auth on refresh
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const userData = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              subscriptionLocations: data.subscriptionLocations || [],
              ...data
            } as User;
            setUser(userData);
            // Set cookies for user id and role
            Cookies.set('userId', userData.id, { sameSite: 'lax', secure: true });
            Cookies.set('isAdmin', userData.isAdmin ? 'true' : 'false', { sameSite: 'lax', secure: true });
          } else {
            // If user doc does not exist, sign out user for safety
            await signOut(auth);
            setUser(null);
            Cookies.remove('userId');
            Cookies.remove('isAdmin');
          }
        } catch (error: any) {
          console.error('Firestore getDoc error:', error);
          toast.error('Failed to fetch user data. Please check your internet connection.');
          setUser(null);
          Cookies.remove('userId');
          Cookies.remove('isAdmin');
        }
      } else {
        setUser(null);
        Cookies.remove('userId');
        Cookies.remove('isAdmin');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Signup: create Firebase user, Firestore doc, and set context
  const signup = async (userData: any): Promise<boolean> => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
      await updateProfile(firebaseUser, {
        displayName: userData.fullName
      });
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, {
        fullName: userData.fullName,
        phone: userData.phone,
        email: userData.email,
        reraNumber: userData.reraNumber,
        state: userData.state,
        city: userData.city,
        location: userData.location,
        subscriptionLocations: userData.subscriptionLocations || [],
        isAdmin: false,
        createdAt: new Date().toISOString()
      });
      Cookies.set('userId', firebaseUser.uid, { sameSite: 'lax', secure: true });
      Cookies.set('isAdmin', 'false', { sameSite: 'lax', secure: true });
      // Fetch fresh user data from Firestore
      await reloadUser();
      return true;
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already exists. Please use a different email.');
      } else {
        toast.error('An error occurred during signup. Please try again.');
      }
      return false;
    }
  };

  // Login: Firebase Auth, Firestore fetch handled by onAuthStateChanged
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will set user and cookies
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid email or password');
      return false;
    }
  };

  // Logout: Firebase Auth, clear context and cookies
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      Cookies.remove('userId');
      Cookies.remove('isAdmin');
      localStorage.removeItem('justSignedUp');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'An error occurred during logout. Please try again.');
    }
  };

  // Update user data in Firestore and context
  const updateUserData = async (userData: User) => {
    try {
      if (!userData.id) throw new Error('No authenticated user');
      if (!Array.isArray(userData.subscriptionLocations)) {
        throw new Error('subscriptionLocations must be an array');
      }
      userData.subscriptionLocations.forEach((loc) => {
        if (
          typeof loc !== 'object' ||
          !loc.id ||
          !loc.name ||
          typeof loc.price !== 'number'
        ) {
          throw new Error('Invalid subscription location object structure');
        }
      });
      const userDocRef = doc(db, 'users', userData.id);
      await updateDoc(
        userDocRef,
        {
          subscriptionLocations: userData.subscriptionLocations,
          updatedAt: new Date().toISOString(),
          ...Object.fromEntries(
            Object.entries(userData).filter(([key]) => key !== 'subscriptionLocations')
          ),
        }
      );
      await reloadUser();
      Cookies.set('isAdmin', userData.isAdmin ? 'true' : 'false');
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update profile. Please try again.');
      throw error;
    }
  };

  // Force reload user from Firestore (after subscription change)
  const reloadUser = async () => {
    if (!auth.currentUser) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        const freshUserData = {
          id: auth.currentUser.uid,
          email: auth.currentUser.email || '',
          subscriptionLocations: data.subscriptionLocations || [],
          ...data
        } as User;
        setUser(freshUserData);
      }
    } catch (error) {
      console.error("Failed to reload user data:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, updateUserData, reloadUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};