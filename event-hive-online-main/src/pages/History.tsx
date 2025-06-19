import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon, Users, Clock, RefreshCw } from "lucide-react";
import EventCard from "@/components/events/EventCard";
import { Event, Registration } from "@/types";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, Timestamp, limit } from "firebase/firestore";
import { format, formatDistanceToNow } from "date-fns";
import AuthModal from "@/components/auth/AuthModal";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { formatDateString } from "@/lib/utils";

export default function History() {
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<(Event & { registrationDate: Date, ticketsBought: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState("created");
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Memoize the fetchUserEvents function to prevent unnecessary re-renders
  const fetchUserEvents = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      console.log("Fetching events for user:", currentUser.uid);
      
      // Fetch events created by the user - using both organizerId and createdBy fields
      const createdEventsQueryByCreatedBy = query(
        collection(db, "events"),
        where("createdBy", "==", currentUser.uid),
        limit(50)
      );
      
      const createdEventsQueryByOrganizerId = query(
        collection(db, "events"),
        where("organizerId", "==", currentUser.uid),
        limit(50)
      );
      
      const [createdBySnapshot, organizerIdSnapshot] = await Promise.all([
        getDocs(createdEventsQueryByCreatedBy),
        getDocs(createdEventsQueryByOrganizerId)
      ]);
      
      console.log(`Found ${createdBySnapshot.size} events by createdBy and ${organizerIdSnapshot.size} events by organizerId`);
      
      // Combine results from both queries (avoiding duplicates by using a Map with document ID as key)
      const eventMap = new Map<string, Event>();
      
      const processSnapshot = (snapshot: any) => {
        snapshot.forEach((doc: any) => {
          if (!eventMap.has(doc.id)) {
            const data = doc.data();
            console.log("Found event:", doc.id, data);
            
            // Create a proper date object from Firestore timestamp
            let createdAt: Date;
            if (data.createdAt instanceof Timestamp) {
              createdAt = new Date(data.createdAt.toMillis());
            } else if (data.createdAt instanceof Date) {
              createdAt = data.createdAt;
            } else {
              createdAt = new Date(); // Fallback to current date
            }
            
            eventMap.set(doc.id, {
              id: doc.id,
              type: data.type,
              title: data.title || data.name,
              date: data.date,
              time: data.time || data.startTime || "",
              location: data.location || data.venue || "",
              description: data.description,
              ticketCount: data.ticketCount,
              registrationFee: data.registrationFee || data.price || 0,
              organizerId: data.organizerId || data.createdBy || "",
              organizerName: data.organizerName || "",
              createdAt: createdAt,
              imageUrl: data.imageUrl || "",
              registeredUsers: data.registeredUsers || []
            });
          }
        });
      };
      
      processSnapshot(createdBySnapshot);
      processSnapshot(organizerIdSnapshot);
      
      // Convert Map values to array and sort
      const fetchedCreatedEvents = Array.from(eventMap.values());
      fetchedCreatedEvents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      console.log("Total unique events found:", fetchedCreatedEvents.length);
      setCreatedEvents(fetchedCreatedEvents);
      
      // Fetch registrations made by the user - simpler query to avoid index issues
      const registrationsQuery = query(
        collection(db, "registrations"),
        where("userId", "==", currentUser.uid),
        limit(50) // Limit results to avoid performance issues
      );
      
      const registrationsSnapshot = await getDocs(registrationsQuery);
      const registeredEventsData: (Event & { registrationDate: Date, ticketsBought: number })[] = [];
      
      // For each registration, fetch the associated event
      const registrationPromises = registrationsSnapshot.docs.map(async (registrationDoc) => {
        const registrationData = registrationDoc.data() as Registration;
        
        if (registrationData.eventId) {
          try {
            const eventDoc = await getDoc(doc(db, "events", registrationData.eventId));
            
            if (eventDoc.exists()) {
              const eventData = eventDoc.data();
              
              // Create proper date objects from Firestore timestamps
              let createdAt: Date;
              if (eventData.createdAt instanceof Timestamp) {
                createdAt = new Date(eventData.createdAt.toMillis());
              } else if (eventData.createdAt instanceof Date) {
                createdAt = eventData.createdAt;
              } else {
                createdAt = new Date(); // Fallback to current date
              }
              
              let registrationDate: Date;
              if (registrationData.registeredAt instanceof Timestamp) {
                registrationDate = new Date(registrationData.registeredAt.toMillis());
              } else if (registrationData.registeredAt instanceof Date) {
                registrationDate = registrationData.registeredAt;
              } else {
                registrationDate = new Date(); // Fallback to current date
              }
              
              registeredEventsData.push({
                id: eventDoc.id,
                type: eventData.type,
                title: eventData.title || eventData.name,
                date: eventData.date,
                time: eventData.time || eventData.startTime || "",
                location: eventData.location || eventData.venue || "",
                description: eventData.description,
                ticketCount: eventData.ticketCount,
                registrationFee: eventData.registrationFee || eventData.price || 0,
                organizerId: eventData.organizerId || eventData.createdBy || "",
                organizerName: eventData.organizerName || "",
                createdAt: createdAt,
                imageUrl: eventData.imageUrl || "",
                registeredUsers: eventData.registeredUsers || [],
                registrationDate: registrationDate,
                ticketsBought: registrationData.ticketCount || 1
              });
            }
          } catch (error) {
            console.error("Error fetching event data:", error);
          }
        }
      });
      
      await Promise.all(registrationPromises);
      
      // Sort by most recent registration date
      registeredEventsData.sort((a, b) => b.registrationDate.getTime() - a.registrationDate.getTime());
      
      setRegisteredEvents(registeredEventsData);
    } catch (error) {
      console.error("Error fetching user events:", error);
      toast({
        title: "Error",
        description: "Failed to load your events. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    if (currentUser) {
      fetchUserEvents();
    } else {
      setLoading(false);
    }
  }, [currentUser, fetchUserEvents]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUserEvents();
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-8 text-center">
              <div className="text-5xl text-eventhub-purple mb-4">🔒</div>
              <h2 className="text-2xl font-bold mb-4">
                Sign In Required
              </h2>
              <p className="text-gray-600 mb-6">
                Please sign in to view your event history
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
                <Button 
                  onClick={() => setShowAuthModal(true)}
                  className="bg-eventhub-purple hover:bg-eventhub-purple-dark"
                >
                  Sign In
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/")}
                >
                  Go to Home
                </Button>
              </div>
            </div>
          </div>
          <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-heading">My Events</h1>
          <p className="text-gray-600 mt-2">
            View all events you've created or registered for
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            className="mt-4"
            disabled={refreshing || loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? "Refreshing..." : "Refresh Events"}
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <Tabs defaultValue="created" value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="flex bg-gray-100 w-full rounded-none">
              <TabsTrigger className="flex-1 py-4 font-medium" value="created">
                Events Created
              </TabsTrigger>
              <TabsTrigger className="flex-1 py-4 font-medium" value="registered">
                Events Registered
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="created" className="p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eventhub-purple"></div>
                </div>
              ) : createdEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {createdEvents.map((event) => (
                    <EventCard key={event.id} event={event} onRegister={fetchUserEvents} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎫</div>
                  <h3 className="text-xl font-semibold mb-2">No Events Created Yet</h3>
                  <p className="text-gray-500 mb-6">
                    You haven't created any events yet. Start by creating your first event!
                  </p>
                  <Button 
                    onClick={() => navigate("/create")}
                    className="bg-eventhub-purple hover:bg-eventhub-purple-dark"
                  >
                    Create Event
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="registered" className="p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eventhub-purple"></div>
                </div>
              ) : registeredEvents.length > 0 ? (
                <div className="space-y-6">
                  {registeredEvents.map((event) => (
                    <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/4 relative">
                          {event.imageUrl ? (
                            <div className="aspect-square md:aspect-auto md:h-full">
                              <img
                                src={event.imageUrl}
                                alt={event.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="aspect-square md:aspect-auto md:h-full flex items-center justify-center bg-eventhub-purple/10 text-eventhub-purple">
                              <span className="text-4xl">
                                {event.type === "Wedding" ? "💍" : 
                                 event.type === "Business Meeting" ? "💼" :
                                 event.type === "Party" ? "🎉" :
                                 event.type === "Conference" ? "🎤" : "🎪"}
                              </span>
                            </div>
                          )}
                          <Badge className="absolute top-2 right-2 bg-eventhub-orange">
                            {event.type}
                          </Badge>
                        </div>
                        
                        <div className="md:w-3/4 flex flex-col">
                          <CardHeader className="pb-0">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-xl font-bold">{event.title}</CardTitle>
                              <Badge className="bg-eventhub-purple px-3 py-1.5">
                                {event.ticketsBought} {event.ticketsBought > 1 ? 'Tickets' : 'Ticket'}
                              </Badge>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pt-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="flex items-center text-gray-600">
                                <CalendarIcon className="h-4 w-4 mr-2 text-eventhub-purple" />
                                <span>{formatDateString(event.date)}</span>
                              </div>
                              
                              <div className="flex items-center text-gray-600">
                                <MapPinIcon className="h-4 w-4 mr-2 text-eventhub-purple" />
                                <span className="truncate">{event.location}</span>
                              </div>
                              
                              <div className="flex items-center text-gray-600">
                                <Clock className="h-4 w-4 mr-2 text-eventhub-purple" />
                                <span>Registered {formatDistanceToNow(event.registrationDate, { addSuffix: true })}</span>
                              </div>
                            </div>
                            
                            <Separator className="my-4" />
                            
                            <div className="flex justify-between items-center">
                              <div className="text-eventhub-purple font-bold text-lg">
                                Amount Paid: ₹{(event.registrationFee * event.ticketsBought).toLocaleString()}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-eventhub-purple text-eventhub-purple hover:bg-eventhub-purple/10"
                                onClick={() => navigate(`/browse?type=${encodeURIComponent(event.type)}`)}
                              >
                                More {event.type} Events
                              </Button>
                            </div>
                            
                            {event.description && (
                              <div className="mt-3 text-sm text-gray-600 line-clamp-2">
                                {event.description}
                              </div>
                            )}
                          </CardContent>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎟️</div>
                  <h3 className="text-xl font-semibold mb-2">No Registrations Yet</h3>
                  <p className="text-gray-500 mb-6">
                    You haven't registered for any events yet. Browse available events to register!
                  </p>
                  <Button 
                    onClick={() => navigate("/browse")}
                    className="bg-eventhub-purple hover:bg-eventhub-purple-dark"
                  >
                    Browse Events
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
