
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users } from "lucide-react";
import { Event } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { isRegisteredForEvent } = useAuth();
  const isRegistered = isRegisteredForEvent(event.id);
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate availability percentage
  const availabilityPercentage = event.capacity && event.registeredCount 
    ? Math.round(((event.capacity - event.registeredCount) / event.capacity) * 100) 
    : 100;

  return (
    <Card className="event-card overflow-hidden h-full flex flex-col">
      <div className="relative">
        <img 
          src={event.imageUrl} 
          alt={event.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge className="capitalize bg-primary">{event.category}</Badge>
        </div>
      </div>
      
      <CardContent className="pt-6 flex-grow">
        <h3 className="text-xl font-bold mb-2 line-clamp-2">{event.title}</h3>
        
        <div className="flex items-center text-gray-600 mb-2">
          <Calendar className="h-4 w-4 mr-2" />
          <span className="text-sm">{formatDate(event.date)} | {event.time}</span>
        </div>
        
        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="h-4 w-4 mr-2" />
          <span className="text-sm">{event.location}</span>
        </div>
        
        {event.capacity && event.registeredCount && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{event.registeredCount}/{event.capacity} registered</span>
              </span>
              <span className={`
                ${availabilityPercentage > 50 ? 'text-green-600' : 
                  availabilityPercentage > 20 ? 'text-amber-600' : 'text-red-600'}
              `}>
                {availabilityPercentage}% available
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${
                  availabilityPercentage > 50 ? 'bg-green-500' : 
                  availabilityPercentage > 20 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${(event.registeredCount / event.capacity) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <p className="text-gray-600 line-clamp-3 text-sm">{event.description}</p>
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <div className="w-full flex justify-between items-center">
          <span className="text-sm text-gray-600">
            By {event.organizer}
          </span>
          <Link to={`/events/${event.id}`}>
            <Button variant={isRegistered ? "outline" : "default"}>
              {isRegistered ? "View Details" : "Learn More"}
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
