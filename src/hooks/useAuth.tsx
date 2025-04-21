
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  registerForEvent: (eventId: string) => void;
  unregisterFromEvent: (eventId: string) => void;
  isRegisteredForEvent: (eventId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data
const mockUser: User = {
  id: "user-1",
  name: "Jane Student",
  email: "jane.student@university.edu",
  registeredEvents: ["event-1", "event-3"],
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  // Simulate retrieving user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("engageU_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = () => {
    // In a real app, this would be an API call
    setUser(mockUser);
    localStorage.setItem("engageU_user", JSON.stringify(mockUser));
    toast({
      title: "Welcome back!",
      description: `Signed in as ${mockUser.name}`,
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("engageU_user");
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
  };

  const registerForEvent = (eventId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to register for events",
        variant: "destructive",
      });
      return;
    }

    if (user.registeredEvents.includes(eventId)) {
      toast({
        title: "Already registered",
        description: "You are already registered for this event",
      });
      return;
    }

    const updatedUser = {
      ...user,
      registeredEvents: [...user.registeredEvents, eventId],
    };

    setUser(updatedUser);
    localStorage.setItem("engageU_user", JSON.stringify(updatedUser));
    
    toast({
      title: "Registration successful",
      description: "You have been registered for this event",
    });
  };

  const unregisterFromEvent = (eventId: string) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      registeredEvents: user.registeredEvents.filter(id => id !== eventId),
    };

    setUser(updatedUser);
    localStorage.setItem("engageU_user", JSON.stringify(updatedUser));
    
    toast({
      title: "Unregistered",
      description: "You have been unregistered from this event",
    });
  };

  const isRegisteredForEvent = (eventId: string): boolean => {
    return user ? user.registeredEvents.includes(eventId) : false;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      registerForEvent, 
      unregisterFromEvent,
      isRegisteredForEvent
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
