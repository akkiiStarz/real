import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useAuth } from '../../utils/authContext';
import logo from '../../assets/logo.png';

const Footer: React.FC = () => {
  const { user } = useAuth();

  return (
<footer className="bg-white shadow-md pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src={logo} alt="Logo" className="h-24 w-28 object-contain" />
              {/* <span className="font-bold text-xl">Deals4Property</span> */}
            </div>
            <p className="text-black mb-4">
              Connecting brokers with quality real estate listings across India. Find the perfect property for your clients with our comprehensive database.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-black hover:text-accent transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-black hover:text-accent transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-black hover:text-accent transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-black hover:text-accent transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-black hover:text-accent transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-black hover:text-accent transition-colors">Dashboard</Link>
              </li>
              {!user?.isAdmin && (
                <li>
                  <Link to="/inventory" className="text-black hover:text-accent transition-colors">My Inventory</Link>
                </li>
              )}
              <li>
                <Link to="/subscription" className="text-black hover:text-accent transition-colors">Subscription</Link>
              </li>
              <li>
                <Link to="/profile" className="text-black hover:text-accent transition-colors">Profile</Link>
              </li>
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Property Types</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-black hover:text-accent transition-colors">Residential</a>
              </li>
              <li>
                <a href="#" className="text-black hover:text-accent transition-colors">Commercial</a>
              </li>
              <li>
                <a href="#" className="text-black hover:text-accent transition-colors">Villas</a>
              </li>
              <li>
                <a href="#" className="text-black hover:text-accent transition-colors">Apartments</a>
              </li>
              <li>
                <a href="#" className="text-black hover:text-accent transition-colors">Plots</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-accent mr-2 mt-0.5" />
                <span className="text-black">123 Real Estate Avenue, Mumbai, Maharashtra 400001</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-accent mr-2" />
                <span className="text-black">+91 9876543210</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-accent mr-2" />
                <span className="text-black">contact@estatex.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-700 mt-8 pt-6 text-center text-black text-sm">
          <p>&copy; {new Date().getFullYear()} EstateX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
