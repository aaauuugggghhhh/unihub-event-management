import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  User,
  CalendarCheck,
  CalendarX,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { eventService } from "@/services/eventService";
import { Event } from "@/types";
import { useToast } from "@/components/ui/use-toast";

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!id) {
        setError("Event ID is missing.");
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const fetchedEvent = await eventService.getEvent(id);
        setEvent(fetchedEvent);

        if (user) {
          const registrations = await eventService.getEventRegistrations(id);
          setIsRegistered(registrations.includes(user.id));
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load event details';
        setError(errorMessage);
        toast({
          title: "Error Loading Event",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventDetails();
  }, [id, user, toast]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "EEEE, MMMM d, yyyy");
    } catch {
      return "Invalid Date";
    }
  };

  const handleRegisterToggle = async () => {
    if (!user) {
      toast({ title: "Please sign in to register for events.", variant: "default" });
      navigate("/auth");
      return;
    }
    if (!event) return;

    setIsRegistering(true);
    try {
      if (isRegistered) {
        await eventService.unregisterFromEvent(event.id, user.id);
        setIsRegistered(false);
        setEvent(prev => prev ? { ...prev, registeredCount: prev.registeredCount - 1 } : null);
        toast({ title: "Registration Cancelled", description: `You are no longer registered for ${event.title}.` });
      } else {
        if (event.capacity && event.registeredCount >= event.capacity) {
          toast({ title: "Event Full", description: "This event has reached its capacity.", variant: "destructive" });
          return;
        }
        await eventService.registerForEvent(event.id, user.id);
        setIsRegistered(true);
        setEvent(prev => prev ? { ...prev, registeredCount: prev.registeredCount + 1 } : null);
        toast({ title: "Registered Successfully!", description: `You are now registered for ${event.title}.` });
      }
    } catch (err) {
      const action = isRegistered ? "cancel registration" : "register";
      const errorMessage = err instanceof Error ? err.message : `Failed to ${action}.`;
      toast({ title: `Error`, description: errorMessage, variant: "destructive" });
    } finally {
      setIsRegistering(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !event) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <p className="mb-8">{error || "Sorry, the event you're looking for doesn't exist or has been removed."}</p>
          <Button onClick={() => navigate("/events")}>
            Back to Events
          </Button>
        </div>
      </Layout>
    );
  }

  const capacity = event.capacity || 0;
  const registeredCount = event.registeredCount || 0;
  const availabilityPercentage = capacity > 0
    ? Math.max(0, Math.round(((capacity - registeredCount) / capacity) * 100))
    : 100;
  const isFull = capacity > 0 && registeredCount >= capacity;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-8 text-primary hover:bg-primary-foreground"
        >
          ← Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-80 object-cover rounded-lg mb-6 shadow-md"
              />
            ) : (
              <div className="w-full h-80 bg-gray-200 rounded-lg mb-6 flex items-center justify-center shadow-md">
                <Calendar className="h-24 w-24 text-gray-400" />
              </div>
            )}

            <h1 className="text-4xl font-bold mb-4 text-primary-dark">{event.title}</h1>

            <div className="flex flex-wrap gap-2 mb-6">
              <Badge className="capitalize bg-secondary text-secondary-foreground">{event.category}</Badge>
              {isRegistered && (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  <CalendarCheck className="mr-1 h-3 w-3" />
                  Registered
                </Badge>
              )}
              {isFull && (
                <Badge variant="destructive">
                  Full
                </Badge>
              )}
            </div>

            <div className="space-y-6 text-gray-700">
              {event.description && <p className="text-lg leading-relaxed">{event.description}</p>}

              <div className="border-t border-b border-gray-200 py-6 space-y-5">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-4 mt-1 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">Date</p>
                    <p>{formatDate(event.date)}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 mr-4 mt-1 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">Time</p>
                    <p>{event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-4 mt-1 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">Location</p>
                    <p>{event.location}</p>
                  </div>
                </div>
                {event.organizer && (
                  <div className="flex items-start">
                    <User className="h-5 w-5 mr-4 mt-1 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-800">Organizer</p>
                      <p>{event.organizer}</p>
                    </div>
                  </div>
                )}
                {capacity > 0 && (
                  <div className="flex items-start">
                    <Users className="h-5 w-5 mr-4 mt-1 text-primary flex-shrink-0" />
                    <div className="w-full">
                      <p className="font-semibold text-gray-800 mb-1">Capacity</p>
                      <p className="text-sm mb-2">{registeredCount} / {capacity} registered ({availabilityPercentage}% available)</p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${availabilityPercentage > 50 ? 'bg-green-500' : availabilityPercentage > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${(registeredCount / capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg shadow-md sticky top-24 border border-gray-200">
              <h3 className="text-xl font-semibold mb-5 text-gray-800">Event Registration</h3>

              {isRegistered ? (
                <>
                  <div className="bg-green-100 border border-green-200 rounded-md p-4 mb-6 text-green-800">
                    <div className="flex items-center">
                      <CalendarCheck className="h-5 w-5 mr-3 flex-shrink-0" />
                      <p className="font-medium text-sm">You are registered for this event!</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
                    onClick={handleRegisterToggle}
                    disabled={isRegistering}
                  >
                    {isRegistering ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cancelling...</>
                    ) : (
                      <><CalendarX className="mr-2 h-4 w-4" /> Cancel Registration</>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <p className="mb-6 text-gray-600 text-sm">
                    {isFull ? "This event is currently full." : "Secure your spot for this event by registering now."}
                  </p>
                  <Button
                    className="w-full mb-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={handleRegisterToggle}
                    disabled={isFull || isRegistering}
                  >
                    {isRegistering ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...</>
                    ) : (
                      <><CalendarCheck className="mr-2 h-4 w-4" /> Register for Event</>
                    )}
                  </Button>
                  {isFull && (
                    <p className="text-red-600 text-sm text-center font-medium">
                      Registration is closed.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventDetail;
