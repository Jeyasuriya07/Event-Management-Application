import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon, TicketIcon, Plus, Minus } from "lucide-react";
import { formatDistanceToNow, format, parseISO } from "date-fns";
import { Event, PaymentMethod } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import PaymentModal from "@/components/payments/PaymentModal";
import { useToast } from "@/components/ui/use-toast";
import { EVENT_TYPES } from "@/lib/constants";
import { db } from "@/lib/firebase";
import { doc, updateDoc, collection, addDoc, serverTimestamp, query, where, getDocs, getDoc, arrayUnion } from "firebase/firestore";
import { registerForEvent } from "@/lib/events";

interface EventCardProps {
  event: Event;
  onRegister?: () => void;
}

export default function EventCard({ event, onRegister }: EventCardProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [ticketsToRegister, setTicketsToRegister] = useState(1);
  const [registered, setRegistered] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    try {
      // Try to parse the ISO date string
      const date = parseISO(dateString);
      return format(date, "PPP");
    } catch (error) {
      // Fallback to direct formatting if parsing fails
      try {
        return format(new Date(dateString), "PPP");
      } catch (err) {
        console.error("Date formatting error:", err);
        return dateString; // Return the original string if all formatting fails
      }
    }
  };

  // Check if current user is the creator of this event
  const isOwnEvent = currentUser && currentUser.uid === event.organizerId;

  const handleTicketChange = (increment: boolean) => {
    if (increment) {
      if (ticketsToRegister < event.ticketCount) {
        setTicketsToRegister(prev => prev + 1);
      } else {
        toast({
          title: "Maximum tickets reached",
          description: `You can only purchase up to ${event.ticketCount} tickets`,
          variant: "destructive",
        });
      }
    } else {
      if (ticketsToRegister > 1) {
        setTicketsToRegister(prev => prev - 1);
      }
    }
  };

  const handleRegisterClick = async () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to register for this event",
        variant: "destructive",
      });
      return;
    }

    if (event.registrationFee === 0) {
      // For free events, register directly without payment
      await handlePaymentSuccess("Free" as PaymentMethod);
      return;
    }

    // For paid events, show payment modal
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentMethod: PaymentMethod) => {
    if (!currentUser) return;
    
    try {
      setRegistering(true);
      
      // Check if there are enough tickets
      if (event.ticketCount < ticketsToRegister) {
        toast({
          title: "Not enough tickets",
          description: `Only ${event.ticketCount} tickets available`,
          variant: "destructive",
        });
        return;
      }
      
      // Check if user already has a registration
      const registrationQuery = query(
        collection(db, "registrations"),
        where("eventId", "==", event.id),
        where("userId", "==", currentUser.uid)
      );
      
      const registrationSnapshot = await getDocs(registrationQuery);
      
      // Handle user registration document
      if (!registrationSnapshot.empty) {
        // User already has a registration for this event
        const registrationDoc = registrationSnapshot.docs[0];
        const registrationData = registrationDoc.data();
        const existingTickets = registrationData.ticketCount || 0;
        const newTicketCount = existingTickets + ticketsToRegister;
        
        console.log(`User already has ${existingTickets} tickets, updating to ${newTicketCount}`);
        
        await updateDoc(registrationDoc.ref, {
          ticketCount: newTicketCount,
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Create new registration
        await addDoc(collection(db, "registrations"), {
          eventId: event.id,
          userId: currentUser.uid,
          ticketCount: ticketsToRegister,
          registeredAt: new Date().toISOString(),
          paymentAmount: event.registrationFee * ticketsToRegister,
          paymentMethod: paymentMethod,
          attendeePhone: currentUser.phoneNumber || "",
          status: 'confirmed'
        });
      }
      
      // Update event document with a SINGLE combined operation
      try {
        const eventRef = doc(db, "events", event.id);
        const eventDoc = await getDoc(eventRef);
        
        if (!eventDoc.exists()) {
          throw new Error("Event not found");
        }
        
        const currentTickets = eventDoc.data().ticketCount || 0;
        const newTicketCount = currentTickets - ticketsToRegister;
        
        console.log(`Updating ticket count from ${currentTickets} to ${newTicketCount}`);
        
        // Combine both updates into a single operation
        await updateDoc(eventRef, {
          ticketCount: newTicketCount,
          registeredUsers: arrayUnion(currentUser.uid)
        });
        
        console.log("Event updated successfully");
      } catch (err) {
        console.error("Error updating event:", err);
        toast({
          title: "Update Failed",
          description: "Failed to update event data",
          variant: "destructive",
        });
      }
      
      setRegistered(true);
      toast({
        title: "Success",
        description: "Registration successful!",
      });
      
      // Refresh event data
      const eventRef = doc(db, "events", event.id);
      const updatedEventDoc = await getDoc(eventRef);
      if (updatedEventDoc.exists()) {
        const updatedEventData = updatedEventDoc.data();
        setTicketsToRegister(1); // Reset to 1 after successful registration
      }
      
      if (onRegister) {
        onRegister();
      }
      
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: "Error completing registration",
        variant: "destructive",
      });
    } finally {
      setRegistering(false);
      setShowPaymentModal(false);
    }
  };

  // Find the event type info
  const eventTypeInfo = EVENT_TYPES.find(et => et.type === event.type);

  return (
    <>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="aspect-video relative overflow-hidden bg-gray-100">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-eventhub-purple/10 text-eventhub-purple">
              <span className="text-4xl">{eventTypeInfo?.icon || '🎉'}</span>
            </div>
          )}
          <Badge className="absolute top-2 right-2 bg-eventhub-orange">
            {event.type}
          </Badge>
          {isOwnEvent && (
            <Badge className="absolute top-2 left-2 bg-eventhub-purple">
              Your Event
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2 line-clamp-1">{event.title}</h3>
          
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2 text-eventhub-purple" />
              <span>{formatDate(event.date)} • {event.time}</span>
            </div>
            <div className="flex items-center">
              <MapPinIcon className="h-4 w-4 mr-2 text-eventhub-purple" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
            <div className="flex items-center">
              <TicketIcon className="h-4 w-4 mr-2 text-eventhub-purple" />
              <span>
                {event.ticketCount > 0 
                  ? `${event.ticketCount} tickets available` 
                  : "Sold out"}
              </span>
            </div>
          </div>

          <Separator className="my-3" />
          
          <div className="flex justify-between items-center">
            <div>
              <div className="text-eventhub-purple font-semibold">
                {event.registrationFee > 0 
                  ? `₹${event.registrationFee.toLocaleString()} per ticket` 
                  : "Free"}
              </div>
              <div className="text-xs text-gray-500">
                {formatDistanceToNow(
                  typeof event.createdAt === 'string' 
                    ? new Date(event.createdAt)
                    : event.createdAt instanceof Date
                    ? event.createdAt
                    : new Date(),
                  { addSuffix: true }
                )}
              </div>
            </div>
            <div className="text-xs font-medium">
              By {event.organizerName}
            </div>
          </div>

          {event.ticketCount > 0 && !isOwnEvent && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">Number of tickets:</div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTicketChange(false)}
                  disabled={ticketsToRegister <= 1}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{ticketsToRegister}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTicketChange(true)}
                  disabled={ticketsToRegister >= event.ticketCount}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="bg-gray-50 p-4 flex justify-between">
          <p className="text-sm text-gray-500 truncate max-w-[60%]">
            {event.description.length > 80
              ? `${event.description.substring(0, 80)}...`
              : event.description}
          </p>
          
          <div className="flex flex-col items-end">
            {event.registrationFee > 0 && (
              <div className="text-sm text-gray-600 mb-2">
                Total: ₹{(event.registrationFee * ticketsToRegister).toLocaleString()}
              </div>
            )}
            <Button
              onClick={handleRegisterClick}
              disabled={registering || event.ticketCount <= 0 || isOwnEvent}
              className={`${
                event.ticketCount <= 0 || isOwnEvent
                  ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                  : "bg-eventhub-purple hover:bg-eventhub-purple-dark"
              }`}
            >
              {registering
                ? "Registering..."
                : isOwnEvent
                ? "Your Event"
                : event.ticketCount <= 0
                ? "Sold Out"
                : "Register"}
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amount={event.registrationFee * ticketsToRegister}
          onSuccess={handlePaymentSuccess}
          title="Event Registration"
          description={`Complete payment to register for ${event.title} (${ticketsToRegister} ticket${ticketsToRegister > 1 ? 's' : ''})`}
        />
      )}
    </>
  );
}
