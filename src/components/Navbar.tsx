import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Bell, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";

const Navbar = () => {
  const { user, signInWithGoogle, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <Calendar className="h-6 w-6" />
              <span className="font-bold text-xl">UNIHUB</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/events" className="hover:text-secondary transition-colors">
              Events
            </Link>
            <Link to="/calendar" className="hover:text-secondary transition-colors">
              My Calendar
            </Link>
            {/* NEW: Admin Link */}
            <Link to="/admin" className="hover:text-secondary transition-colors">
              Admin
            </Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/notifications" className="hover:text-secondary relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <div className="relative group">
                  <Button variant="ghost" className="p-1">
                    <User className="h-5 w-5" />
                    <span className="ml-2">{user.user_metadata?.full_name?.split(' ')[0] || 'User'}</span>
                  </Button>
                  <div className="absolute right-0 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    <button 
                      onClick={signOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Button onClick={signInWithGoogle} variant="secondary">
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3">
            <Link 
              to="/events" 
              className="block py-2 hover:text-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Events
            </Link>
            <Link 
              to="/calendar" 
              className="block py-2 hover:text-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              My Calendar
            </Link>
            <Link
              to="/admin"
              className="block py-2 hover:text-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin
            </Link>
            {user ? (
              <>
                <Link 
                  to="/notifications" 
                  className="block py-2 hover:text-secondary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Notifications {unreadCount > 0 && `(${unreadCount})`}
                </Link>
                <Link 
                  to="/profile" 
                  className="block py-2 hover:text-secondary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 hover:text-secondary"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Button onClick={signInWithGoogle} variant="secondary" className="w-full">
                Sign In
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
