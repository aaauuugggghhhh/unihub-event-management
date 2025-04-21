
import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

const categories = [
  { value: "academic", label: "Academic" },
  { value: "social", label: "Social" },
  { value: "sports", label: "Sports" },
  { value: "arts", label: "Arts" },
  { value: "career", label: "Career" },
  { value: "workshop", label: "Workshops" },
  { value: "other", label: "Other" },
];

const AdminPage: React.FC = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    category: categories[0].value,
    description: "",
    organizer: "",
    imageUrl: "",
    capacity: 100,
  });
  const [events, setEvents] = useState<any[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === "capacity" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.time || !form.location) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    setEvents([...events, form]);
    toast({
      title: "Event Added",
      description: `${form.title} has been added.`,
    });
    setForm({
      title: "",
      date: "",
      time: "",
      location: "",
      category: categories[0].value,
      description: "",
      organizer: "",
      imageUrl: "",
      capacity: 100,
    });
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-2xl py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">Admin – Add New Event</h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
          <div>
            <label className="block font-medium mb-1">Title<span className="text-red-500">*</span></label>
            <Input name="title" value={form.title} onChange={handleChange} placeholder="Event Title" required />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium mb-1">Date<span className="text-red-500">*</span></label>
              <Input name="date" value={form.date} onChange={handleChange} type="date" required />
            </div>
            <div className="flex-1">
              <label className="block font-medium mb-1">Time<span className="text-red-500">*</span></label>
              <Input name="time" value={form.time} onChange={handleChange} type="text" placeholder="e.g. 10:00 AM - 4:00 PM" required />
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Location<span className="text-red-500">*</span></label>
            <Input name="location" value={form.location} onChange={handleChange} required />
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
            <Input name="organizer" value={form.organizer} onChange={handleChange} />
          </div>
          <div>
            <label className="block font-medium mb-1">Image URL</label>
            <Input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://..." />
          </div>
          <div>
            <label className="block font-medium mb-1">Capacity</label>
            <Input name="capacity" value={form.capacity} onChange={handleChange} type="number" min={1} />
          </div>
          <Button type="submit" className="w-full mt-4">Add Event</Button>
        </form>

        {events.length > 0 && (
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Preview – Events Added</h2>
            <ul className="space-y-4">
              {events.map((ev, idx) => (
                <li key={idx} className="p-3 bg-white border rounded shadow flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{ev.title}</span>
                    <Badge>{categories.find(c => c.value === ev.category)?.label}</Badge>
                  </div>
                  <div className="text-gray-500 text-sm">
                    {ev.date} • {ev.time} • {ev.location}
                  </div>
                  {ev.description && <div className="text-sm">{ev.description}</div>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminPage;
