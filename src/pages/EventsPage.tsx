import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import EventsList from "@/components/EventsList";
import { eventService } from "@/services/eventService";
import { Event } from "@/types";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const EventsPage = () => {
  const location = useLocation();
  const { toast } = useToast();
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get("category");
  
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const allEvents = await eventService.getAllEvents();

        const filteredEvents = categoryParam
          ? allEvents.filter(event => event.category === categoryParam)
          : allEvents;

        setEvents(filteredEvents);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load events';
        setError(errorMessage);
        toast({
          title: "Error Loading Events",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [categoryParam, toast]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">University Events</h1>
        <p className="text-gray-600 mb-8">
          Browse and register for upcoming events on campus
        </p>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-600">
            <p>Error loading events: {error}</p>
          </div>
        ) : (
          <EventsList initialEvents={events} />
        )}
      </div>
    </Layout>
  );
};

export default EventsPage;
