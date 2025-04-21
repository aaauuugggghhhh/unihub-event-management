import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Event } from "@/types";
import { eventService } from "@/services/eventService";
import { useToast } from "@/components/ui/use-toast";

const ProfilePage: React.FC = () => {
  const { user, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserEvents = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const events = await eventService.getUserRegisteredEvents(user.id);
        setRegisteredEvents(events);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load your registered events",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserEvents();
  }, [user]);

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto max-w-md py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Profile</h1>
          <p className="mb-6 text-gray-700">Please sign in to view your profile</p>
          <Button onClick={signInWithGoogle}>Sign In</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            {user.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt="Profile"
                className="w-20 h-20 rounded-full"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {user.user_metadata?.full_name || user.email}
              </h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Your Registered Events</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : registeredEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">You haven't registered for any events yet.</p>
              <Button variant="link" onClick={() => window.location.href = "/"}>
                Browse Events
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {registeredEvents.map((event) => (
                <div
                  key={event.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        {event.title}
                      </h3>
                      <p className="text-gray-600">
                        {event.date} • {event.startTime} - {event.endTime}
                      </p>
                      <p className="text-gray-600">{event.location}</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = `/events/${event.id}`}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage; 