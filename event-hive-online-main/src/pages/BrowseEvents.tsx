import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Search } from "lucide-react";
import { Event, EventType } from "@/types";
import { EVENT_TYPES } from "@/lib/constants";
import EventCard from "@/components/events/EventCard";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy, startAfter, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, addDays, addMonths } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

// Dummy events data for seeding
const dummyEvents: Omit<Event, 'id' | 'createdAt'>[] = [
  {
    type: "Wedding",
    title: "Sharma & Patel Wedding",
    date: addDays(new Date(), 14).toISOString(),
    time: "18:00",
    location: "Grand Palace Banquet Hall, Mumbai",
    description: "Join us to celebrate the union of Rahul Sharma and Priya Patel in a traditional Indian wedding ceremony.",
    ticketCount: 200,
    registrationFee: 0,
    organizerId: "system",
    organizerName: "Wedding Planners Inc.",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1170",
    registeredUsers: []
  },
  {
    type: "Business Meeting",
    title: "Startup Investor Pitch Day",
    date: addDays(new Date(), 7).toISOString(),
    time: "10:00",
    location: "Business Hub, Hyderabad",
    description: "Present your startup to potential investors and network with industry professionals.",
    ticketCount: 50,
    registrationFee: 5000,
    organizerId: "system",
    organizerName: "Startup India",
    imageUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=1170",
    registeredUsers: []
  },
  {
    type: "Conference",
    title: "Healthcare Innovation Conference",
    date: addMonths(new Date(), 2).toISOString(),
    time: "09:00",
    location: "Medical Research Center, Chennai",
    description: "Explore the latest advancements in healthcare technology and medical research.",
    ticketCount: 120,
    registrationFee: 3499,
    organizerId: "system",
    organizerName: "MedTech Association",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1170",
    registeredUsers: []
  },
  {
    type: "Party",
    title: "New Year's Eve Spectacular",
    date: new Date(new Date().getFullYear(), 11, 31).toISOString(),
    time: "20:00",
    location: "Oceanfront Resort, Goa",
    description: "Ring in the new year with a beachfront celebration featuring music, fireworks, and gourmet cuisine.",
    ticketCount: 250,
    registrationFee: 4999,
    organizerId: "system",
    organizerName: "Goa Events Co.",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1170",
    registeredUsers: []
  }
];

export default function BrowseEvents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  // Check if there are events and add dummy events if needed
  useEffect(() => {
    checkAndSeedEvents();
  }, []);

  // Get type from URL params on initial load
  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam) {
      setSelectedType(typeParam);
    }
  }, [searchParams]);

  // Fetch events on initial load and when filters change
  useEffect(() => {
    fetchEvents(true);
  }, [selectedType, date, priceRange, availableOnly]);

  const checkAndSeedEvents = async () => {
    try {
      // Check if there are any events
      const eventsQuery = query(collection(db, "events"), limit(3));
      const snapshot = await getDocs(eventsQuery);
      
      // If there are 2 or fewer events, seed with dummy data
      if (snapshot.size <= 2 && !isSeeding) {
        setIsSeeding(true);
        
        // Add dummy events
        for (const eventData of dummyEvents) {
          await addDoc(collection(db, "events"), {
            ...eventData,
            createdAt: serverTimestamp()
          });
        }
        
        toast({
          title: "Demo data loaded",
          description: "Sample events have been added for demonstration",
        });
        
        // Fetch events after seeding
        fetchEvents(true);
        setIsSeeding(false);
      }
    } catch (error) {
      console.error("Error checking/seeding events:", error);
      toast({
        title: "Error",
        description: "Failed to load sample events. Please try again.",
        variant: "destructive"
      });
      setIsSeeding(false);
    }
  };

  const fetchEvents = async (reset = false) => {
    try {
      setLoading(true);
      
      // Start building the query
      let eventsQuery = collection(db, "events");
      let constraints = [];
      
      // Add filters one at a time to avoid composite index issues
      if (selectedType && selectedType !== "all") {
        constraints.push(where("type", "==", selectedType));
      }
      
      // Create base query with first constraint if exists
      let baseQuery = constraints.length > 0 
        ? query(eventsQuery, constraints[0], orderBy("createdAt", "desc"), limit(12))
        : query(eventsQuery, orderBy("createdAt", "desc"), limit(12));
      
      // Add pagination if not resetting
      if (!reset && lastDoc) {
        baseQuery = constraints.length > 0
          ? query(eventsQuery, constraints[0], orderBy("createdAt", "desc"), startAfter(lastDoc), limit(12))
          : query(eventsQuery, orderBy("createdAt", "desc"), startAfter(lastDoc), limit(12));
      }
      
      const querySnapshot = await getDocs(baseQuery);
      
      // Update last document for pagination
      if (!querySnapshot.empty) {
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      } else {
        setHasMore(false);
      }
      
      // Process results and apply remaining filters in memory
      let fetchedEvents: Event[] = [];
      
      querySnapshot.forEach((doc) => {
        const eventData = doc.data() as {
          type: EventType;
          title: string;
          date: string;
          time: string;
          location: string;
          description: string;
          ticketCount: number;
          registrationFee: number;
          organizerId: string;
          organizerName: string;
          createdAt: { seconds: number; nanoseconds: number };
          imageUrl: string;
          registeredUsers: string[];
        };
        
        // Apply remaining filters in memory
        let passesFilters = true;
        
        // Date filter
        if (date) {
          const eventDate = new Date(eventData.date);
          const selectedDate = new Date(date);
          if (
            eventDate.getFullYear() !== selectedDate.getFullYear() ||
            eventDate.getMonth() !== selectedDate.getMonth() ||
            eventDate.getDate() !== selectedDate.getDate()
          ) {
            passesFilters = false;
          }
        }
        
        // Price range filter
        if (priceRange[0] > 0 && eventData.registrationFee < priceRange[0]) {
          passesFilters = false;
        }
        if (priceRange[1] < 10000 && eventData.registrationFee > priceRange[1]) {
          passesFilters = false;
        }
        
        // Available only filter
        if (availableOnly && eventData.ticketCount <= 0) {
          passesFilters = false;
        }
        
        if (passesFilters) {
          const createdAt = eventData.createdAt ? 
            new Date(eventData.createdAt.seconds * 1000) : 
            new Date();
            
          fetchedEvents.push({
            id: doc.id,
            type: eventData.type,
            title: eventData.title,
            date: eventData.date,
            time: eventData.time,
            location: eventData.location,
            description: eventData.description,
            ticketCount: eventData.ticketCount,
            registrationFee: eventData.registrationFee,
            organizerId: eventData.organizerId,
            organizerName: eventData.organizerName,
            createdAt: createdAt,
            imageUrl: eventData.imageUrl,
            registeredUsers: eventData.registeredUsers
          });
        }
      });
      
      // Filter by search term if provided
      if (searchTerm) {
        fetchedEvents = fetchedEvents.filter(event => 
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (reset) {
        setEvents(fetchedEvents);
      } else {
        setEvents(prev => [...prev, ...fetchedEvents]);
      }
      
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error",
        description: "Failed to fetch events. Please try again with different filters.",
        variant: "destructive"
      });
      setEvents([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents(true);
  };

  const handleLoadMore = () => {
    fetchEvents(false);
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedType("");
    setDate(undefined);
    setPriceRange([0, 10000]);
    setAvailableOnly(false);
    setSearchParams({});
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-heading">Browse Events</h1>
          <p className="text-gray-600 mt-2">
            Discover and register for upcoming events
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-lg font-bold mb-4">Filters</h2>
            
            <form onSubmit={handleSearch} className="space-y-6">
              {/* Search Input */}
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Input
                    id="search"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              {/* Event Type */}
              <div className="space-y-2">
                <Label htmlFor="event-type">Event Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger id="event-type">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {EVENT_TYPES.map((eventType) => (
                      <SelectItem key={eventType.type} value={eventType.type}>
                        <div className="flex items-center">
                          <span className="mr-2">{eventType.icon}</span>
                          <span>{eventType.type}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Date Picker */}
              <div className="space-y-2">
                <Label>Event Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !date ? "text-muted-foreground" : ""
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Price Range */}
              <div className="space-y-4">
                <div>
                  <Label>Price Range</Label>
                  <div className="flex items-center justify-between mt-1">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>
                <Slider
                  value={[priceRange[0], priceRange[1]]}
                  min={0}
                  max={10000}
                  step={500}
                  onValueChange={(value) => setPriceRange([value[0], value[1]])}
                  className="mt-2"
                />
              </div>
              
              {/* Available Only */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="available-only"
                  checked={availableOnly}
                  onCheckedChange={(checked) => setAvailableOnly(checked === true)}
                />
                <Label htmlFor="available-only">Available events only</Label>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button 
                  type="submit"
                  className="bg-eventhub-purple hover:bg-eventhub-purple-dark"
                  disabled={loading || isSeeding}
                >
                  {isSeeding ? "Adding sample events..." : "Apply Filters"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleReset}
                  disabled={loading || isSeeding}
                >
                  Reset Filters
                </Button>
              </div>
            </form>
          </div>
          
          {/* Events Grid */}
          <div className="lg:col-span-3">
            {loading && events.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eventhub-purple"></div>
              </div>
            ) : events.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      onRegister={() => fetchEvents(true)}
                    />
                  ))}
                </div>
                
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={handleLoadMore}
                      variant="outline"
                      disabled={loading}
                      className="border-eventhub-purple text-eventhub-purple hover:bg-eventhub-purple/10"
                    >
                      {loading ? "Loading..." : "Load More Events"}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
                <p className="text-gray-500 mb-4">
                  We couldn't find any events matching your filters.
                </p>
                <Button onClick={handleReset}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
