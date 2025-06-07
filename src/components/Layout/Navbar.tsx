import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserCircle, LogOut, Home, ListChecks, Settings } from 'lucide-react';
import { useAuth } from '../../utils/authContext';
import Button from '../ui/Button';
import logo from '../../assets/logo.png';

const Navbar: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    // Close dropdown on user login or signup
    setDropdownOpen(false);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isInventoryPage = location.pathname === '/inventory';

  if (loading) {
    // While loading auth state, render nothing or a placeholder to avoid flash
    return null;
  }

  return (
    <header className="bg-white text-black shadow-md">

      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-2">
              <img src={logo} alt="Logo" className="h-24 w-24 object-contain" />
            </Link>
          
          {user ? (
            <div className="flex items-center space-x-6">
              <nav className="hidden md:flex items-center space-x-4">
                <Link
                  to="/"
                  className="px-3 py-2 rounded transition-colors flex items-center hover:text-accent"
                >
                  <Home className="h-4 w-4 mr-1" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/dashboard"
                  className="px-3 py-2 rounded transition-colors flex items-center hover:text-accent"
                >
                  <ListChecks className="h-4 w-4 mr-1" />
                  <span>Dashboard</span>
                </Link>
                {!user.isAdmin && (
                  <Link
                    to="/inventory"
                    className={`px-3 py-2 rounded transition-colors flex items-center hover:text-accent ${
                      isInventoryPage ? 'text-accent' : ''
                    }`}
                  >
                    {/* Removed logo image from My Inventory */}
                    <span>My Inventory</span>
                  </Link>
                )}
                {user.isAdmin && (
                  <Link
                    to="/admin"
                    className="px-3 py-2 rounded transition-colors flex items-center hover:text-accent"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    <span>Admin</span>
                  </Link>
                )}
              </nav>
              
              <div className="flex items-center">
                <div className="mr-4 hidden md:block">
                  <div className="text-sm font-medium">{user.fullName}</div>
                  <div className="text-xs opacity-80">{user.email}</div>
                </div>
                <div className="relative">
                  <button
                    className="flex items-center space-x-1"
                    onClick={() => setDropdownOpen((prev: boolean) => !prev)}
                    onDoubleClick={() => setDropdownOpen(false)}
                  >
                    <UserCircle className="h-8 w-8" />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">Profile</Link>
                      <Link to="/subscription" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">My Subscription</Link>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-error hover:bg-neutral-100"
                      >
                        <div className="flex items-center">
                          <LogOut className="h-4 w-4 mr-1" />
                          <span>Logout</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline" size="sm" className="text-white border-white hover:bg-primary-light">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
