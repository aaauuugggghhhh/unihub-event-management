
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">EngageU</h3>
            <p className="text-gray-600 mb-4">
              Your one-stop platform for university events and activities.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-gray-600 hover:text-primary transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/calendar" className="text-gray-600 hover:text-primary transition-colors">
                  My Calendar
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Event Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/events?category=academic" className="text-gray-600 hover:text-primary transition-colors">
                  Academic
                </Link>
              </li>
              <li>
                <Link to="/events?category=social" className="text-gray-600 hover:text-primary transition-colors">
                  Social
                </Link>
              </li>
              <li>
                <Link to="/events?category=sports" className="text-gray-600 hover:text-primary transition-colors">
                  Sports
                </Link>
              </li>
              <li>
                <Link to="/events?category=career" className="text-gray-600 hover:text-primary transition-colors">
                  Career
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Contact</h3>
            <ul className="space-y-2 text-gray-600">
              <li>University Campus</li>
              <li>support@engageu.edu</li>
              <li>(555) 123-4567</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-500 text-sm">
          <p>&copy; {currentYear} EngageU. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
