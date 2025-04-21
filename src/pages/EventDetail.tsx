
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  User,
  CalendarCheck,
  CalendarX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { getEventById, getUpcomingEvents } from "@/data/events";
import { useAuth } from "@/hooks/useAuth";
import EventCard from "@/components/EventCard";

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, registerForEvent, unregisterFromEvent, isRegisteredForEvent } = useAuth();
  
  const event = id ? getEventById(id) : null;
  const isRegistered = id ? isRegisteredForEvent(id) : false;
  
  if (!event) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <p className="mb-8">Sorry, the event you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/events")}>
            Back to Events
          </Button>
        </div>
      </Layout>
    );
  }
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "EEEE, MMMM d, yyyy");
  };
  
  const similarEvents = getUpcomingEvents(3).filter(e => e.id !== event.id);
  
  // Calculate availability percentage
  const availabilityPercentage = event.capacity && event.registeredCount 
    ? Math.round(((event.capacity - event.registeredCount) / event.capacity) * 100) 
    : 100;

  const handleRegister = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (isRegistered) {
      unregisterFromEvent(event.id);
    } else {
      registerForEvent(event.id);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-8"
        >
          ← Back
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left column - Event image */}
          <div className="lg:col-span-2">
            <img 
              src={event.imageUrl} 
              alt={event.title}
              className="w-full h-80 object-cover rounded-lg mb-6"
            />
            
            <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge className="capitalize bg-primary">{event.category}</Badge>
              
              {isRegistered && (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  <CalendarCheck className="mr-1 h-3 w-3" />
                  Registered
                </Badge>
              )}
            </div>
            
            <div className="space-y-6 text-gray-600">
              <p className="text-lg">{event.description}</p>
              
              <div className="border-t border-b py-6 space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="font-medium">Date</p>
                    <p>{formatDate(event.date)}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p>{event.time}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p>{event.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="font-medium">Organizer</p>
                    <p>{event.organizer}</p>
                  </div>
                </div>
                
                {event.capacity && event.registeredCount && (
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-3 text-primary" />
                    <div className="w-full">
                      <div className="flex justify-between mb-1">
                        <p className="font-medium">Capacity</p>
                        <p className={`
                          ${availabilityPercentage > 50 ? 'text-green-600' : 
                            availabilityPercentage > 20 ? 'text-amber-600' : 'text-red-600'}
                        `}>
                          {availabilityPercentage}% available
                        </p>
                      </div>
                      <p className="mb-2">{event.registeredCount}/{event.capacity} registered</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            availabilityPercentage > 50 ? 'bg-green-500' : 
                            availabilityPercentage > 20 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(event.registeredCount / event.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right column - Registration */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm sticky top-24">
              <h3 className="text-xl font-bold mb-4">Event Registration</h3>
              
              {isRegistered ? (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                    <div className="flex">
                      <CalendarCheck className="h-6 w-6 text-green-500 mr-3" />
                      <div>
                        <p className="font-medium text-green-800">You're registered!</p>
                        <p className="text-green-700 text-sm">This event is in your calendar</p>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full border-red-300 text-red-700 hover:bg-red-50"
                    onClick={handleRegister}
                  >
                    <CalendarX className="mr-2 h-4 w-4" />
                    Cancel Registration
                  </Button>
                </>
              ) : (
                <>
                  <p className="mb-6 text-gray-600">
                    Secure your spot for this event by registering now.
                  </p>
                  <Button 
                    className="w-full mb-4"
                    onClick={handleRegister}
                    disabled={event.capacity && event.registeredCount && event.registeredCount >= event.capacity}
                  >
                    <CalendarCheck className="mr-2 h-4 w-4" />
                    Register for Event
                  </Button>
                  {event.capacity && event.registeredCount && event.registeredCount >= event.capacity && (
                    <p className="text-red-600 text-sm text-center">
                      This event is at full capacity
                    </p>
                  )}
                </>
              )}
              
              <div className="mt-8">
                <h4 className="font-medium text-gray-700 mb-2">Important Information</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                  <li>Please arrive 15 minutes early</li>
                  <li>Student ID required for entry</li>
                  <li>Registration can be canceled up to 24 hours before the event</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Similar Events */}
        {similarEvents.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Similar Events You Might Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EventDetail;
