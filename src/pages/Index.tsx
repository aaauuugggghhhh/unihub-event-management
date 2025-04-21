import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Search, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import EventsList from "@/components/EventsList";
import { eventService } from "@/services/eventService";
import { Event } from "@/types";
import { isAfter, parseISO, startOfToday, isSameDay } from 'date-fns';

const Index = () => {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const allEvents = await eventService.getAllEvents();
        
        const today = startOfToday();
        const upcomingEvents = allEvents
          .filter(event => isAfter(parseISO(event.date), today) || isSameDay(parseISO(event.date), today))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
        setFeaturedEvents(upcomingEvents.slice(0, 3));

      } catch (err) {
        console.error("Failed to fetch featured events:", err);
        setError("Could not load featured events."); 
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeaturedEvents();
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-pattern py-16 lg:py-24">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-primary">
              Discover Campus Life
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8">
              Your one-stop platform for all university events. Discover, register, and 
              never miss out on campus activities that matter to you.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/events">
                <Button size="lg" className="w-full sm:w-auto">
                  <Search className="mr-2 h-5 w-5" />
                  Explore Events
                </Button>
              </Link>
              <Link to="/calendar">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <Calendar className="mr-2 h-5 w-5" />
                  My Calendar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Featured Events</h2>
            <Link to="/events">
              <Button variant="link">View All Events</Button>
            </Link>
          </div>
          
          {isLoading ? (
             <div className="flex justify-center items-center h-40">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
           ) : error ? (
             <div className="text-center py-10 text-red-600">
               <p>{error}</p>
             </div>
           ) : featuredEvents.length > 0 ? (
             <EventsList initialEvents={featuredEvents} showFilters={false} />
           ) : (
             <div className="text-center py-10 text-gray-500">
                <p>No upcoming events featured right now. Check back soon!</p>
             </div>
           )}
        </div>
      </section>

      {/* Info Blocks Section */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="bg-primary/10 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Discover Events</h3>
              <p className="text-gray-600">
                Browse through a wide range of university events, from academic
                lectures to social gatherings and sports tournaments.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="bg-primary/10 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Register with Ease</h3>
              <p className="text-gray-600">
                Simple one-click registration for any event that interests you.
                Receive confirmation and reminders via email.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="bg-primary/10 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Manage Your Calendar</h3>
              <p className="text-gray-600">
                Keep track of all your registered events in your personal calendar.
                Never miss an important event again.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Enhance Your Campus Experience?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of students who are making the most of their university life
            by engaging with campus activities and events.
          </p>
          <Link to="/events">
            <Button size="lg" variant="secondary">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
