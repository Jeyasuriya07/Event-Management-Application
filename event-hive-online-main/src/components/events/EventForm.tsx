import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { EVENT_TYPES, MAX_TICKET_COUNT } from "@/lib/constants";
import { EventType } from "@/types";
import PaymentModal from "@/components/payments/PaymentModal";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { CalendarIcon, ImagePlus } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createEvent } from "@/lib/events";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Define form validation schema
const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  type: z.string().min(1, "Event type is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  location: z.string().min(1, "Location is required"),
  ticketCount: z.number().min(1, "Ticket count must be at least 1"),
  registrationFee: z.number().min(0, "Registration fee cannot be negative"),
});

// Phone number validation schema
const phoneFormSchema = z.object({
  phoneNumber: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\d+$/, "Phone number must contain only digits")
});

type EventFormData = z.infer<typeof eventFormSchema>;
type PhoneFormData = z.infer<typeof phoneFormSchema>;

export default function EventForm() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [formData, setFormData] = useState<EventFormData | null>(null);
  const [eventCreationFee, setEventCreationFee] = useState(0);
  const [showPhoneNumberModal, setShowPhoneNumberModal] = useState(false);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "",
      date: "",
      time: "",
      location: "",
      ticketCount: 1,
      registrationFee: 0,
    },
  });

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  const selectedType = form.watch("type");
  const selectedEventTypeInfo = EVENT_TYPES.find((type) => type.type === selectedType);

  // Update creation fee when event type changes
  React.useEffect(() => {
    if (selectedEventTypeInfo) {
      setEventCreationFee(selectedEventTypeInfo.price);
    }
  }, [selectedEventTypeInfo]);

  const onSubmit = async (data: EventFormData) => {
    if (!currentUser) {
      setError("You must be logged in to create an event");
      return;
    }

    // Check if user has a phone number
    if (!currentUser.phoneNumber) {
      setFormData(data);
      setShowPhoneNumberModal(true);
      return;
    }

    // Proceed with payment and event creation
    setFormData(data);
    setShowPaymentModal(true);
  };

  const handlePhoneSubmit = async (phoneData: PhoneFormData) => {
    if (!currentUser || !formData) return;

    try {
      // Update user profile with phone number
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        phoneNumber: phoneData.phoneNumber
      });

      // Update local user object
      currentUser.phoneNumber = phoneData.phoneNumber;
      
      toast({
        title: "Phone number updated",
        description: "Your phone number has been saved successfully",
      });

      // Close the modal and continue with event creation
      setShowPhoneNumberModal(false);
      setShowPaymentModal(true);
    } catch (err) {
      console.error("Failed to update phone number:", err);
      toast({
        title: "Error",
        description: "Failed to update phone number. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePaymentSuccess = async () => {
    if (!formData || !currentUser) return;

    setIsSubmitting(true);
    setError(null);

    try {
      console.log("Form data:", formData);
      console.log("Current user:", currentUser);
      console.log("Selected event type info:", selectedEventTypeInfo);

      // Prepare the event data with explicit types and all necessary fields
      const eventData = {
        type: formData.type as EventType,
        title: formData.title,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        description: formData.description,
        ticketCount: Number(formData.ticketCount),
        registrationFee: Number(formData.registrationFee),
        organizerId: currentUser.uid,
        organizerName: currentUser.displayName || "Anonymous",
        imageUrl: selectedEventTypeInfo?.defaultImage || "",
        registeredUsers: [],
        // Add explicit fields for history page queries
        createdBy: currentUser.uid,
      };
      
      console.log("Prepared event data:", eventData);

      try {
        const eventId = await createEvent(eventData);
        console.log("Event created with ID:", eventId);
        
        toast({
          title: "Event created",
          description: "Your event has been created successfully",
        });
        
        // Navigate to history page to see the created event
        navigate("/history");
      } catch (err) {
        console.error("Error in createEvent:", err);
        throw err; // Re-throw to be caught by outer catch
      }
    } catch (err) {
      console.error("Failed to create event:", err);
      let errorMessage = "Failed to create event. Please try again.";
      
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
      setShowPaymentModal(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Event</h1>
      {selectedEventTypeInfo && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-2">Default Event Image</h3>
          <div className="aspect-video w-full max-h-[200px] overflow-hidden rounded-md">
            <img 
              src={selectedEventTypeInfo.defaultImage} 
              alt={`${selectedEventTypeInfo.type} event`} 
              className="w-full h-full object-cover"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            This image will be automatically used for your {selectedEventTypeInfo.type} event
          </p>
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an event type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EVENT_TYPES.map((eventType) => (
                        <SelectItem key={eventType.type} value={eventType.type}>
                          <div className="flex items-center">
                            <span className="mr-2">{eventType.icon}</span>
                            <span>{eventType.type}</span>
                            <span className="ml-2 text-sm text-gray-500">
                              (Creation fee: ₹{eventType.price.toLocaleString()})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a catchy name for your event" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Event Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={`w-full pl-3 text-left font-normal ${
                            !field.value ? "text-muted-foreground" : ""
                          }`}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          // Ensure we have a valid date string
                          if (date) {
                            const dateStr = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
                            console.log("Selected date:", dateStr);
                            field.onChange(dateStr);
                          } else {
                            field.onChange("");
                          }
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ticketCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Tickets</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="registrationFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Fee per Ticket (₹)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe your event..." 
                    className="min-h-[120px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedEventTypeInfo && (
            <div className="bg-eventhub-purple/10 p-4 rounded-md">
              <h3 className="font-medium text-eventhub-purple">Event Creation Fee</h3>
              <p className="text-sm text-gray-600 mt-1">
                There is a fee of <span className="font-bold">₹{eventCreationFee.toLocaleString()}</span> to create this type of event.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                This is separate from the registration fee you set for attendees.
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="bg-eventhub-purple hover:bg-eventhub-purple-dark"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Event..." : "Create Event"}
            </Button>
          </div>
        </form>
      </Form>

      {/* Phone Number Collection Modal */}
      <Dialog open={showPhoneNumberModal} onOpenChange={setShowPhoneNumberModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Your Phone Number</DialogTitle>
            <DialogDescription>
              Please provide your phone number for event management purposes.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...phoneForm}>
            <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-4">
              <FormField
                control={phoneForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your phone number" 
                        {...field} 
                        type="tel"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPhoneNumberModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Save & Continue
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amount={eventCreationFee}
          onSuccess={handlePaymentSuccess}
          title="Event Creation Fee"
          description={`Complete payment to create your ${selectedType} event`}
        />
      )}
    </div>
  );
}
