import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  getDoc, 
  doc, 
  updateDoc,
  arrayUnion 
} from "firebase/firestore";
import { Event } from "@/types";

export async function createEvent(eventData: Omit<Event, "id" | "createdAt">) {
  try {
    console.log("Creating event with data:", JSON.stringify(eventData, null, 2));
    
    // Directly prepare the document to add to Firestore
    const eventToCreate = {
      type: eventData.type,
      title: eventData.title,
      date: eventData.date,
      time: eventData.time,
      location: eventData.location,
      description: eventData.description,
      ticketCount: Number(eventData.ticketCount),
      registrationFee: Number(eventData.registrationFee),
      organizerId: eventData.organizerId,
      organizerName: eventData.organizerName,
      imageUrl: eventData.imageUrl || "",
      registeredUsers: eventData.registeredUsers || [],
      createdAt: serverTimestamp(),
      createdBy: eventData.organizerId
    };
    
    console.log("Sanitized event data:", JSON.stringify(eventToCreate, null, 2));
    
    const eventRef = collection(db, "events");
    const docRef = await addDoc(eventRef, eventToCreate);
    
    console.log("Event created successfully with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error creating event:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw new Error(`Failed to create event: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function registerForEvent(eventId: string, userId: string, ticketCount: number) {
  try {
    console.log("Registering for event:", { eventId, userId, ticketCount });
    
    if (!eventId) {
      throw new Error("Event ID is required");
    }
    if (!userId) {
      throw new Error("User ID is required");
    }
    if (ticketCount <= 0) {
      throw new Error("Ticket count must be positive");
    }
    
    const eventRef = doc(db, "events", eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (!eventDoc.exists()) {
      throw new Error("Event not found");
    }
    
    const eventData = eventDoc.data();
    console.log("Event data retrieved:", JSON.stringify(eventData, null, 2));
    
    // Use the actual field names from Firestore
    const currentTicketCount = Number(eventData.ticketCount || 0);
    
    // Check if there are enough tickets available
    if (currentTicketCount < ticketCount) {
      throw new Error(`Not enough tickets available. Requested: ${ticketCount}, Available: ${currentTicketCount}`);
    }
    
    // Update event with new registration
    try {
      await updateDoc(eventRef, {
        ticketCount: currentTicketCount - ticketCount,
        registeredUsers: arrayUnion(userId)
      });
      console.log("Registration successful");
      return true;
    } catch (updateError) {
      console.error("Error updating event document:", updateError);
      throw new Error(`Failed to update event: ${updateError instanceof Error ? updateError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error("Error registering for event:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw new Error(`Failed to register for event: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 