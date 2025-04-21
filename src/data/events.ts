
import { Event } from "@/types";

export const events: Event[] = [
  {
    id: "event-1",
    title: "Annual Science Fair",
    description: "Explore innovative student projects from various scientific disciplines. Great opportunity to see cutting-edge research by your peers and network with faculty members.",
    date: "2025-05-15",
    time: "10:00 AM - 4:00 PM",
    location: "Science Building, Main Hall",
    category: "academic",
    organizer: "Science Department",
    imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    capacity: 300,
    registeredCount: 187
  },
  {
    id: "event-2",
    title: "Spring Campus Concert",
    description: "Join us for a night of music featuring student bands and special guest performers. Food and refreshments will be available.",
    date: "2025-05-20",
    time: "7:00 PM - 10:00 PM",
    location: "Campus Amphitheater",
    category: "social",
    organizer: "Student Activities Board",
    imageUrl: "https://images.unsplash.com/photo-1501612780327-45045538702b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    capacity: 500,
    registeredCount: 342
  },
  {
    id: "event-3",
    title: "Career Fair 2025",
    description: "Meet representatives from over 50 companies hiring for internships and full-time positions. Bring your resume and dress professionally.",
    date: "2025-05-25",
    time: "9:00 AM - 3:00 PM",
    location: "Student Union, Grand Ballroom",
    category: "career",
    organizer: "Career Services",
    imageUrl: "https://images.unsplash.com/photo-1560439514-4e9645039924?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    capacity: 1000,
    registeredCount: 623
  },
  {
    id: "event-4",
    title: "Basketball Tournament",
    description: "Annual intramural basketball tournament. Form your team of 5 players and compete for the campus championship trophy.",
    date: "2025-06-01",
    time: "9:00 AM - 6:00 PM",
    location: "University Gymnasium",
    category: "sports",
    organizer: "Campus Recreation",
    imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    capacity: 200,
    registeredCount: 142
  },
  {
    id: "event-5",
    title: "Art Exhibition Opening",
    description: "Opening night for the student art exhibition featuring works from the Fine Arts program. Wine and cheese reception included.",
    date: "2025-06-05",
    time: "6:00 PM - 9:00 PM",
    location: "Art Building Gallery",
    category: "arts",
    organizer: "Fine Arts Department",
    imageUrl: "https://images.unsplash.com/photo-1531058020387-3be344556be6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    capacity: 150,
    registeredCount: 98
  },
  {
    id: "event-6",
    title: "Coding Workshop: Web Development",
    description: "Learn the basics of web development including HTML, CSS, and JavaScript. No prior coding experience necessary.",
    date: "2025-06-10",
    time: "1:00 PM - 4:00 PM",
    location: "Computer Science Building, Room 101",
    category: "workshop",
    organizer: "Computer Science Club",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    capacity: 50,
    registeredCount: 43
  },
  {
    id: "event-7",
    title: "Environmental Sustainability Talk",
    description: "Guest speaker Dr. Emily Green will discuss climate action and campus sustainability initiatives.",
    date: "2025-06-15",
    time: "5:30 PM - 7:00 PM",
    location: "Environmental Studies Building, Auditorium",
    category: "academic",
    organizer: "Environmental Club",
    imageUrl: "https://images.unsplash.com/photo-1516937941344-00b4e0337589?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    capacity: 200,
    registeredCount: 112
  },
  {
    id: "event-8",
    title: "End of Semester Party",
    description: "Celebrate the end of finals with food, music, and games. Open to all students with valid ID.",
    date: "2025-06-20",
    time: "8:00 PM - 12:00 AM",
    location: "Student Union, Outdoor Patio",
    category: "social",
    organizer: "Student Government",
    imageUrl: "https://images.unsplash.com/photo-1496337589254-7e19d01cec44?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    capacity: 400,
    registeredCount: 289
  }
];

export const getEventById = (id: string): Event | undefined => {
  return events.find(event => event.id === id);
};

export const getEventsByCategory = (category: string): Event[] => {
  return category === 'all' 
    ? events 
    : events.filter(event => event.category === category);
};

export const getUpcomingEvents = (limit?: number): Event[] => {
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  return limit ? sortedEvents.slice(0, limit) : sortedEvents;
};
