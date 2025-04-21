
import React from "react";
import { useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import EventsList from "@/components/EventsList";
import { getEventsByCategory } from "@/data/events";

const EventsPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get("category");
  
  const eventsData = categoryParam 
    ? getEventsByCategory(categoryParam)
    : getEventsByCategory("all");

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">University Events</h1>
        <p className="text-gray-600 mb-8">
          Browse and register for upcoming events on campus
        </p>
        
        <EventsList initialEvents={eventsData} />
      </div>
    </Layout>
  );
};

export default EventsPage;
