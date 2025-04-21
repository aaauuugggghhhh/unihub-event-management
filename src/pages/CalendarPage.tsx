
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { format, parseISO, isEqual, isSameMonth, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { events } from "@/data/events";
import { Event } from "@/types";
import { Badge } from "@/components/ui/badge";

const CalendarPage = () => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<"month" | "list">("month");
  
  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <CalendarIcon className="h-16 w-16 mx-auto text-primary mb-6" />
            <h2 className="text-2xl font-bold mb-4">Sign In to View Your Calendar</h2>
            <p className="mb-8 text-gray-600">
              Sign in to view and manage your registered events in your personal calendar.
            </p>
            <Button>Sign In</Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Filter events to only include registered events
  const registeredEvents = events.filter(event => 
    user.registeredEvents.includes(event.id)
  );
  
  // Find events for the selected date
  const getEventsForDay = (day: Date) => {
    return registeredEvents.filter(event => 
      isSameDay(parseISO(event.date), day)
    );
  };
  
  // Sort events by date
  const sortedEvents = [...registeredEvents].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const groupEventsByDate = (events: Event[]) => {
    const grouped: Record<string, Event[]> = {};
    
    events.forEach(event => {
      const dateKey = event.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    
    return grouped;
  };
  
  const groupedEvents = groupEventsByDate(sortedEvents);
  const dateKeys = Object.keys(groupedEvents).sort();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">My Calendar</h1>
        <p className="text-gray-600 mb-8">
          View and manage all your registered events
        </p>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {view === "month" ? format(date, "MMMM yyyy") : "Upcoming Events"}
          </h2>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <Button
                variant={view === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("month")}
                className="rounded-md"
              >
                Month
              </Button>
              <Button
                variant={view === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("list")}
                className="rounded-md"
              >
                List
              </Button>
            </div>
          </div>
        </div>
        
        {registeredEvents.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-800 mb-2">No Events Yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't registered for any events yet. Browse events to add them to your calendar.
            </p>
            <Link to="/events">
              <Button>Browse Events</Button>
            </Link>
          </div>
        ) : view === "month" ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 border-b">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newDate = new Date(date);
                  newDate.setMonth(date.getMonth() - 1);
                  setDate(newDate);
                }}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="font-semibold">
                {format(date, "MMMM yyyy")}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newDate = new Date(date);
                  newDate.setMonth(date.getMonth() + 1);
                  setDate(newDate);
                }}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                className="rounded-md border"
                month={date}
                onMonthChange={setDate}
              />
            </div>
            
            {/* Display events for selected date */}
            <div className="p-4 border-t">
              <h3 className="font-medium mb-4">
                Events for {format(date, "MMMM d, yyyy")}
              </h3>
              
              {getEventsForDay(date).length === 0 ? (
                <p className="text-gray-500">No events scheduled for this day</p>
              ) : (
                <div className="space-y-3">
                  {getEventsForDay(date).map((event) => (
                    <Link
                      to={`/events/${event.id}`}
                      key={event.id}
                      className="block p-3 rounded-md border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-gray-600">
                            {event.time} • {event.location}
                          </p>
                        </div>
                        <Badge className="capitalize">{event.category}</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          // List View
          <div className="bg-white rounded-lg shadow">
            {dateKeys.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No upcoming events</p>
              </div>
            ) : (
              <div className="divide-y">
                {dateKeys.map(dateKey => (
                  <div key={dateKey} className="p-4">
                    <h3 className="font-medium text-lg mb-4">
                      {format(parseISO(dateKey), "EEEE, MMMM d, yyyy")}
                    </h3>
                    
                    <div className="space-y-3">
                      {groupedEvents[dateKey].map(event => (
                        <Link
                          to={`/events/${event.id}`}
                          key={event.id}
                          className="block p-3 rounded-md border hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-medium">{event.title}</h4>
                              <p className="text-sm text-gray-600">
                                {event.time} • {event.location}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="capitalize">{event.category}</Badge>
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CalendarPage;
