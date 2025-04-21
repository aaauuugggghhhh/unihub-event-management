import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Trash2, Loader2, Users, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { eventService, RegistrationWithUser } from "@/services/eventService";
import { Event, EventCategory } from "@/types";
import { testConnection } from "@/lib/testConnection";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";

const categories = [
  { value: "academic", label: "Academic" },
  { value: "social", label: "Social" },
  { value: "sports", label: "Sports" },
  { value: "arts", label: "Arts" },
  { value: "career", label: "Career" },
  { value: "workshop", label: "Workshops" },
  { value: "other", label: "Other" },
];

const ADMIN_EMAILS = [
  "jane.student@university.edu",
  "pranavkrishna6242@gmail.com"
];

const AdminPage: React.FC = () => {
  const { toast } = useToast();
  const { user, signInWithGoogle } = useAuth();
  const [form, setForm] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    category: "academic" as EventCategory,
    description: "",
    organizer: "",
    imageUrl: "",
    capacity: 100,
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedEventForRegistrations, setSelectedEventForRegistrations] = useState<Event | null>(null);
  const [registrationsList, setRegistrationsList] = useState<RegistrationWithUser[]>([]);
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);
  const [registrationsError, setRegistrationsError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const initializePage = async () => {
      try {
        setIsInitializing(true);
        setError(null);
        
        // Test database connection
        const isConnected = await testConnection();
        if (!isConnected) {
          throw new Error('Failed to connect to the database. Please check your connection and try again.');
        }

        // Load events
        await loadEvents();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
        toast({
          title: "Connection Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initializePage();
  }, []);

  const loadEvents = async () => {
    try {
      setError(null);
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load events';
      setError(errorMessage);
      toast({
        title: "Error loading events",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === "capacity" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.startTime || !form.endTime || !form.location) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate that end time is after start time
    if (form.startTime >= form.endTime) {
      toast({
        title: "Invalid time range",
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const newEvent = await eventService.createEvent({
        ...form,
        registeredCount: 0,
      });
      setEvents([...events, newEvent]);
      toast({
        title: "Event Added",
        description: `${form.title} has been added successfully.`,
      });
      setForm({
        title: "",
        date: "",
        startTime: "",
        endTime: "",
        location: "",
        category: "academic" as EventCategory,
        description: "",
        organizer: "",
        imageUrl: "",
        capacity: 100,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add event';
      setError(errorMessage);
      toast({
        title: "Error adding event",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${eventTitle}"?`)) {
      return;
    }

    try {
      await eventService.deleteEvent(eventId);
      setEvents(events.filter(e => e.id !== eventId));
      toast({
        title: "Event Deleted",
        description: `${eventTitle} has been deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error deleting event",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewRegistrations = async (event: Event) => {
    setSelectedEventForRegistrations(event);
    setRegistrationsList([]);
    setRegistrationsError(null);
    setIsLoadingRegistrations(true);
    try {
      console.log("Checking registrations for user email:", user?.email);
      const registrations = await eventService.getRegistrationsForEvent(event.id);
      setRegistrationsList(registrations);
    } catch (err) {
      console.error("Failed to fetch registrations:", err);
      const message = err instanceof Error ? err.message : "Could not load registrations.";
      setRegistrationsError(message);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsLoadingRegistrations(false);
    }
  };

  // If not logged in, show prompt to sign in
  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto max-w-md py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
          <p className="mb-6 text-gray-700">Please sign in as the admin to access this page.</p>
          <Button onClick={signInWithGoogle} className="mx-auto">Sign In</Button>
        </div>
      </Layout>
    );
  }

  // If logged in but not the admin, block access
  if (!user.email || !ADMIN_EMAILS.includes(user.email)) {
    return (
      <Layout>
        <div className="container mx-auto max-w-md py-20 text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Access Denied</h1>
          <p className="mb-6">You do not have permission to view this page.</p>
        </div>
      </Layout>
    );
  }

  // Show loading state
  if (isInitializing) {
    return (
      <Layout>
        <div className="container mx-auto max-w-md py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Connecting to database...</p>
        </div>
      </Layout>
    );
  }

  // Show error state
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto max-w-md py-20 text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Connection Error</h1>
          <p className="mb-6 text-gray-700">{error}</p>
          <Button onClick={() => window.location.reload()} className="mx-auto">
            Retry Connection
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Dialog 
        open={selectedEventForRegistrations !== null} 
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedEventForRegistrations(null);
            setRegistrationsList([]);
            setRegistrationsError(null);
          }
        }}
      >
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8">Event Management</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-6">Add New Event</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-medium mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    name="title" 
                    value={form.title} 
                    onChange={handleChange}
                    required 
                    placeholder="Event Title"
                  />
                </div>
                
                <div>
                  <label className="block font-medium mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    type="date" 
                    name="date" 
                    value={form.date} 
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      type="time" 
                      name="startTime" 
                      value={form.startTime} 
                      onChange={handleChange}
                      required
                      step="300"
                    />
                  </div>
                  
                  <div>
                    <label className="block font-medium mb-1">
                      End Time <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      type="time" 
                      name="endTime" 
                      value={form.endTime} 
                      onChange={handleChange}
                      required
                      step="300"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Times should be in 24-hour format (e.g., 14:00 for 2:00 PM)
                </p>
                
                <div>
                  <label className="block font-medium mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    name="location" 
                    value={form.location} 
                    onChange={handleChange}
                    required
                    placeholder="Event Location"
                  />
                </div>
                
                <div>
                  <label className="block font-medium mb-1">Category</label>
                  <select
                    className="block w-full border border-gray-300 rounded px-3 py-2"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                  >
                    {categories.map(c => (
                      <option value={c.value} key={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    rows={3}
                    placeholder="Event Description"
                  />
                </div>
                
                <div>
                  <label className="block font-medium mb-1">Organizer</label>
                  <Input 
                    name="organizer" 
                    value={form.organizer} 
                    onChange={handleChange}
                    placeholder="Event Organizer"
                  />
                </div>
                
                <div>
                  <label className="block font-medium mb-1">Image URL</label>
                  <Input 
                    name="imageUrl" 
                    value={form.imageUrl} 
                    onChange={handleChange} 
                    placeholder="https://..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Provide a URL for the event image (optional)
                  </p>
                </div>
                
                <div>
                  <label className="block font-medium mb-1">Capacity</label>
                  <Input 
                    name="capacity" 
                    value={form.capacity} 
                    onChange={handleChange} 
                    type="number" 
                    min={1}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Maximum number of attendees
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full mt-6" 
                  disabled={isLoading}
                >
                  {isLoading ? "Adding Event..." : "Add Event"}
                </Button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-6">Events List</h2>
              {events.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No events added yet</p>
              ) : (
                <ul className="space-y-4">
                  {events.map((ev) => (
                    <li key={ev.id} className="p-3 bg-gray-50 border rounded shadow-sm flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{ev.title}</span>
                          <Badge>{categories.find(c => c.value === ev.category)?.label}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteEvent(ev.id, ev.title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-gray-500 text-sm">
                        {ev.date} • {ev.startTime} - {ev.endTime} • {ev.location}
                      </div>
                      {ev.description && (
                        <div className="text-sm text-gray-600">{ev.description}</div>
                      )}
                      <div className="text-sm text-gray-500 flex justify-between items-center">
                        <DialogTrigger asChild>
                          <Button 
                            variant="link"
                            className="p-0 h-auto text-primary hover:underline"
                            onClick={() => handleViewRegistrations(ev)}
                          >
                            Registered: {ev.registeredCount ?? 0} / {ev.capacity ?? '∞'}
                          </Button>
                        </DialogTrigger>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewRegistrations(ev)}
                          >
                            <Users className="h-3 w-3 mr-1.5" /> View Registrations
                          </Button>
                        </DialogTrigger>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Registrations for "{selectedEventForRegistrations?.title}"</DialogTitle>
          </DialogHeader>
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {isLoadingRegistrations ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : registrationsError ? (
              <div className="text-red-600 text-center p-4">
                Error: {registrationsError}
              </div>
            ) : registrationsList.length === 0 ? (
               <p className="text-gray-500 text-center p-4">No users registered for this event yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name (from metadata)</TableHead>
                    <TableHead>Registered At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrationsList.map((reg) => (
                    <TableRow key={reg.user_id}>
                      <TableCell>{reg.user?.email || 'N/A'}</TableCell>
                       <TableCell>{reg.user?.raw_user_meta_data?.full_name || 'N/A'}</TableCell>
                      <TableCell>{new Date(reg.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
           <DialogFooter>
              <DialogClose asChild>
                 <Button type="button" variant="secondary">Close</Button>
              </DialogClose>
           </DialogFooter>
        </DialogContent>
      </Dialog> 
    </Layout>
  );
};

export default AdminPage;

