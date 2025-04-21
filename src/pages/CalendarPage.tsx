import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format, parseISO, isEqual, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { Calendar as CalendarIcon, Clock, Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Event, EventCategory } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { eventService } from "@/services/eventService";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ViewType = "month" | "list";

// Event colors based on category
const categoryColors: Record<EventCategory, { bg: string, text: string }> = {
  academic: { bg: "bg-blue-100", text: "text-blue-700" },
  social: { bg: "bg-purple-100", text: "text-purple-700" },
  sports: { bg: "bg-green-100", text: "text-green-700" },
  arts: { bg: "bg-yellow-100", text: "text-yellow-700" },
  career: { bg: "bg-orange-100", text: "text-orange-700" },
  workshop: { bg: "bg-teal-100", text: "text-teal-700" },
  other: { bg: "bg-gray-100", text: "text-gray-700" }
};

// Categories for filtering (similar to EventsList)
const filterCategories: { value: string; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "academic", label: "Academic" },
  { value: "social", label: "Social" },
  { value: "sports", label: "Sports" },
  { value: "arts", label: "Arts" },
  { value: "career", label: "Career" },
  { value: "workshop", label: "Workshops" },
  { value: "other", label: "Other" },
];

const CalendarPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<ViewType>("month");
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const fetchedEvents = await eventService.getUserRegisteredEvents(user.id);
        setRegisteredEvents(fetchedEvents);
        setError(null);
      } catch (err) {
        console.error('Error fetching registered events:', err);
        setError('Failed to load your registered events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRegisteredEvents();
  }, [user]);

  // Filtering Logic
  const filteredEvents = useMemo(() => {
    return registeredEvents.filter(event => {
      const searchMatch = 
        (event.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (event.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (event.location?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
      const categoryMatch = selectedCategory === "all" || event.category === selectedCategory;

      return searchMatch && categoryMatch;
    });
  }, [registeredEvents, searchQuery, selectedCategory]);

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter(event =>
      isSameDay(parseISO(event.date), day)
    );
  };
  
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [filteredEvents]);
  
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
  
  const groupedEvents = useMemo(() => groupEventsByDate(sortedEvents), [sortedEvents]);
  const dateKeys = useMemo(() => Object.keys(groupedEvents).sort(), [groupedEvents]);

  // Style calculation for month view events
  const calculateEventStyle = (event: Event, eventsForDay: Event[]) => {
    const eventIndex = eventsForDay.findIndex(e => e.id === event.id);
    const top = eventIndex * 24 + 4; // 24px per event + 4px top offset
    return {
      top: `${top}px`,
      left: '4px',
      right: '4px',
      height: '22px', 
      position: 'absolute' as const,
    };
  };

  const renderDay = (props: { date: Date, displayMonth: Date }) => {
    const { date: day, displayMonth } = props;

    if (!isSameMonth(day, displayMonth)) {
       return <div className="opacity-50"></div>;
    }

    const dayEvents = getEventsForDay(day);

    return (
      <div className="w-full h-full relative p-1" onClick={() => setSelectedDate(day)}>
        {/* Day Number */}
        <div className={cn(
          "absolute top-1 right-1 text-xs w-5 h-5 flex items-center justify-center",
          isSameDay(day, new Date()) && "font-bold text-primary",
          isSameDay(day, selectedDate) && "bg-primary text-primary-foreground rounded-full"
        )}>
          {format(day, "d")}
        </div>
        {/* --- Event Block Rendering Re-enabled --- */}
         <div className="absolute top-6 left-0 right-0 bottom-1 overflow-hidden px-1 space-y-px">
           {dayEvents.slice(0, 3).map((event) => { // Show up to 3 blocks
             const style = calculateEventStyle(event, dayEvents);
             return (
               <div
                 key={event.id}
                 className={cn(
                   "absolute px-1 py-0.5 rounded text-xs truncate cursor-pointer transition-colors shadow-sm", 
                   categoryColors[event.category]?.bg || 'bg-gray-100',
                   categoryColors[event.category]?.text || 'text-gray-700',
                   "hover:opacity-80 hover:ring-1 hover:ring-offset-1 ring-primary"
                 )}
                 style={style}
                 title={`${event.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/events/${event.id}`);
                  }}
               >
                 <span className="ml-1 truncate">{event.title}</span>
               </div>
             );
           })}
           {dayEvents.length > 3 && (
              <div className="text-[10px] text-center text-gray-500 absolute bottom-0 left-0 right-0">
                +{dayEvents.length - 3} more events
             </div>
            )}
         </div>
      </div>
    );
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <CalendarIcon className="h-16 w-16 mx-auto text-primary mb-6" />
            <h2 className="text-2xl font-bold mb-4">Sign In to View Your Calendar</h2>
            <p className="mb-8 text-gray-600">
              Sign in to view and manage your events in your personal calendar.
            </p>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p>Loading your events...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <CalendarIcon className="h-16 w-16 mx-auto text-destructive mb-6" />
            <h2 className="text-2xl font-bold mb-4">Error Loading Events</h2>
            <p className="mb-8 text-gray-600">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" size="icon" onClick={handlePrevMonth} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl md:text-2xl font-bold text-center">
            {format(currentMonth, "MMMM yyyy")}
          </h1>
          <Button variant="outline" size="icon" onClick={handleNextMonth} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg mb-6 flex flex-wrap items-center gap-4">
          <div className="relative flex-grow md:flex-grow-0 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search registered events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex-grow">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="flex-wrap h-auto">
                {filterCategories.map((category) => (
                  <TabsTrigger key={category.value} value={category.value} className="text-xs px-3 py-1.5">
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex space-x-2 border rounded-md p-1 bg-white shadow-sm ml-auto">
             <Button 
               variant={view === 'month' ? 'default' : 'ghost'}
               size="sm"
               onClick={() => setView('month')}
               className={cn("transition-colors text-xs", view === 'month' && 'bg-primary text-primary-foreground shadow')}
             >
               Month View
             </Button>
             <Button 
               variant={view === 'list' ? 'default' : 'ghost'}
               size="sm"
               onClick={() => setView('list')}
               className={cn("transition-colors text-xs", view === 'list' && 'bg-primary text-primary-foreground shadow')}
             >
               List View
             </Button>
           </div>
        </div>

        {view === "month" && (
          <div className="w-full bg-white p-2 md:p-4 rounded-lg shadow-md border">
            <Calendar
              mode="single"
              selected={selectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              onSelect={(day) => setSelectedDate(day || new Date())}
              components={{ DayContent: renderDay }}
              className="p-0 w-full"
              classNames={{
                 caption_label: "hidden",
                 nav_button: "hidden",
                 months: "w-full",
                 table: "w-full border-collapse table-fixed",
                 head_row: "",
                 head_cell: "text-xs font-medium text-muted-foreground pb-2 border-b w-[14.28%]",
                 row: "w-full",
                 cell: "relative text-sm p-0 border h-28",
                 day: "w-full h-full p-1 text-left align-top",
                 day_selected: "!bg-primary/10",
                 day_today: "font-bold text-primary",
                 day_outside: "text-muted-foreground opacity-30 invisible",
                 day_disabled: "text-muted-foreground opacity-50",
                 day_hidden: "invisible",
              }}
            />
          </div>
        )}

        {view === "list" && (
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border">
            <h2 className="text-xl font-bold mb-4">Upcoming Registered Events</h2>
            {dateKeys.length > 0 ? (
              <ScrollArea className="h-[60vh]">
                <div className="space-y-6 pr-4">
                  {dateKeys.map(dateKey => (
                    <div key={dateKey}>
                      <h3 className="text-md font-semibold mb-3 border-b pb-2 sticky top-0 bg-white py-1">
                        {format(parseISO(dateKey), "EEEE, MMMM d, yyyy")}
                      </h3>
                      <ul className="space-y-3">
                        {groupedEvents[dateKey].map(event => (
                          <li key={event.id} className={cn("flex items-start space-x-3 p-3 rounded-md", categoryColors[event.category]?.bg)}>
                             <div className={cn("flex-shrink-0 w-16 text-right", categoryColors[event.category]?.text)}>
                                <p className="font-medium text-sm">{event.startTime}</p>
                                {event.endTime && <p className="text-xs">to {event.endTime}</p>}
                             </div>
                             <div className="flex-grow">
                               <Link to={`/events/${event.id}`} className="hover:underline">
                                 <p className={cn("font-medium", categoryColors[event.category]?.text)}>{event.title}</p>
                               </Link>
                               <p className="text-sm text-gray-600 mt-0.5">{event.location}</p>
                             </div>
                             <Badge variant="outline" className={cn(categoryColors[event.category]?.text, categoryColors[event.category]?.bg?.replace('100', '200'), "border-none capitalize text-xs")}>
                                {event.category}
                             </Badge>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-16">
                 <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                 <p className="text-gray-500">No registered events match your filters.</p>
                 {(searchQuery || selectedCategory !== 'all') && (
                    <Button variant="link" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
                      Clear Filters
                    </Button>
                 )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CalendarPage;
