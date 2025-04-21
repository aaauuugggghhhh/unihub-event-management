
import React, { useState } from "react";
import EventCard from "./EventCard";
import { Event, EventCategory } from "@/types";
import { getEventsByCategory } from "@/data/events";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface EventsListProps {
  initialEvents?: Event[];
  showFilters?: boolean;
}

const EventsList: React.FC<EventsListProps> = ({ 
  initialEvents,
  showFilters = true 
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const events = initialEvents || getEventsByCategory(activeCategory);
  
  const categories: { value: string; label: string }[] = [
    { value: "all", label: "All Events" },
    { value: "academic", label: "Academic" },
    { value: "social", label: "Social" },
    { value: "sports", label: "Sports" },
    { value: "arts", label: "Arts" },
    { value: "career", label: "Career" },
    { value: "workshop", label: "Workshops" },
    { value: "other", label: "Other" },
  ];
  
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.organizer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {showFilters && (
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search events, descriptions, organizers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="w-full overflow-x-auto flex flex-nowrap justify-start md:justify-center py-1 px-1 h-auto">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.value}
                  value={category.value}
                  className="px-4 py-2 whitespace-nowrap"
                >
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}
      
      {filteredEvents.length === 0 ? (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium text-gray-600">No events found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsList;
