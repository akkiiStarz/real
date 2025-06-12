import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import { useAuth } from './utils/authContext';

// Lazy loaded components
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Profile = lazy(() => import('./pages/Profile'));
const Subscription = lazy(() => import('./pages/Subscription'));
const SubscriptionCheckout = lazy(() => import('./pages/SubscriptionCheckout'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Compare = lazy(() => import('./pages/Compare'));

// Loading component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-neutral-50">
    <div className="animate-pulse flex flex-col items-center">
      <div className="h-12 w-12 rounded-full bg-primary mb-4"></div>
      <div className="h-4 w-32 bg-neutral-200 rounded"></div>
    </div>
  </div>
);

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  // Allow access to /subscription if just signed up
  if (
    !user &&
    localStorage.getItem('justSignedUp') === 'true' &&
    location.pathname === '/subscription'
  ) {
    return children;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Admin route component
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (!user || !user.isAdmin) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return children;
};

// New component for login route to fix hook order violation
const LoginRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;
  if (user) return <Navigate to="/dashboard" state={{ from: location }} replace />;

  return <Login />;
};

// New component for signup route to fix hook order violation
const SignupRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;
  if (user) return <Navigate to="/dashboard" state={{ from: location }} replace />;

  return <Signup />;
};

function App() {
  const { loading } = useAuth();
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Wait for auth state to resolve before rendering routes
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<LoginRoute />} />
          <Route path="signup" element={<SignupRoute />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="inventory"
            element={
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="subscription"
            element={
              <ProtectedRoute>
                <Subscription />
              </ProtectedRoute>
            }
          />
          <Route
            path="subscription/checkout"
            element={
              <ProtectedRoute>
                <SubscriptionCheckout />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
          <Route
            path="compare"
            element={
              <ProtectedRoute>
                <Compare />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;