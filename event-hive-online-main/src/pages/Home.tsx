import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarDays, CheckCircle, Clock, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-eventhub-purple to-eventhub-purple-dark text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold font-heading leading-tight">
                Plan, Manage & Host Your Events with Ease
              </h1>
              <p className="text-lg md:text-xl opacity-90">
                EventHub simplifies event management with powerful tools for registration, 
                ticketing, and promotion. Create unforgettable experiences.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                <Button 
                  asChild
                  size="lg" 
                  className="bg-eventhub-orange hover:bg-eventhub-orange/90 text-white"
                >
                  <Link to="/create">Create Event</Link>
                </Button>
                <Button 
                  asChild
                  size="lg" 
                  className="bg-transparent hover:bg-white hover:text-eventhub-purple border-2 border-white text-white transition-colors"
                >
                  <Link to="/browse">Browse Events</Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3" 
                alt="Event Planning" 
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Event Types Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-heading mb-4">
              Create Any Type of Event
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From intimate weddings to large conferences, EventHub supports
              all types of events with specialized features and pricing.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Wedding */}
            <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className="text-5xl mb-4 text-eventhub-purple">💍</div>
              <h3 className="text-xl font-bold mb-2">Wedding</h3>
              <p className="text-gray-600 mb-4">
                Create beautiful wedding events with guest management and RSVP tracking.
              </p>
              <p className="text-eventhub-purple font-bold">₹5,000</p>
            </div>
            
            {/* Business Meeting */}
            <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className="text-5xl mb-4 text-eventhub-purple">💼</div>
              <h3 className="text-xl font-bold mb-2">Business Meeting</h3>
              <p className="text-gray-600 mb-4">
                Organize professional meetings with attendee tracking and scheduling.
              </p>
              <p className="text-eventhub-purple font-bold">₹1,500</p>
            </div>
            
            {/* Party */}
            <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className="text-5xl mb-4 text-eventhub-purple">🎉</div>
              <h3 className="text-xl font-bold mb-2">Party</h3>
              <p className="text-gray-600 mb-4">
                Host exciting parties with guest lists, invitations, and ticket sales.
              </p>
              <p className="text-eventhub-purple font-bold">₹3,000</p>
            </div>
            
            {/* Conference */}
            <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className="text-5xl mb-4 text-eventhub-purple">🎤</div>
              <h3 className="text-xl font-bold mb-2">Conference</h3>
              <p className="text-gray-600 mb-4">
                Manage large conferences with multiple sessions and comprehensive planning.
              </p>
              <p className="text-eventhub-purple font-bold">₹7,000</p>
            </div>
          </div>
          
          <div className="text-center mt-10">
            <Button 
              asChild
              className="bg-eventhub-purple hover:bg-eventhub-purple-dark"
            >
              <Link to="/create">Start Creating Your Event</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-heading mb-4">
              Why Choose EventHub?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform offers everything you need to create successful events
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="bg-eventhub-purple/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <CalendarDays className="h-7 w-7 text-eventhub-purple" />
              </div>
              <h3 className="text-xl font-bold mb-3">Easy Event Creation</h3>
              <p className="text-gray-600">
                Create professional events in minutes with our intuitive interface.
                Customize every detail to match your vision.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="bg-eventhub-purple/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Users className="h-7 w-7 text-eventhub-purple" />
              </div>
              <h3 className="text-xl font-bold mb-3">Attendee Management</h3>
              <p className="text-gray-600">
                Track registrations, send communications, and manage your guest list
                all from one dashboard.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="bg-eventhub-purple/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <CheckCircle className="h-7 w-7 text-eventhub-purple" />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure Payments</h3>
              <p className="text-gray-600">
                Accept payments securely with multiple payment options and
                instant confirmation for attendees.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="bg-eventhub-purple/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Clock className="h-7 w-7 text-eventhub-purple" />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-time Updates</h3>
              <p className="text-gray-600">
                Get instant notifications and real-time tracking of registrations
                and event activity.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="bg-eventhub-purple/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-eventhub-purple">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Multiple Payment Options</h3>
              <p className="text-gray-600">
                Accept payments via UPI, cards, or digital wallets to give your
                attendees flexible payment choices.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="bg-eventhub-purple/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-eventhub-purple">
                  <path d="M4 17H8M12 17H20M4 12H20M4 7H12M16 7H20" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Customization</h3>
              <p className="text-gray-600">
                Tailor every aspect of your event to match your brand and specific
                requirements with customizable options.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-eventhub-purple-darker text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-heading mb-4">
              What Our Users Say
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Trusted by thousands of event organizers around the world
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <div className="flex items-center space-x-1 text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p className="italic mb-4">
                "EventHub made planning my wedding so much easier. The tools for managing
                guest RSVPs and tracking payments saved me countless hours of work!"
              </p>
              <div className="flex items-center">
                <div className="mr-3 bg-gray-300 rounded-full w-10 h-10 flex items-center justify-center text-eventhub-purple-darker font-bold">
                  AM
                </div>
                <div>
                  <h4 className="font-bold">Anjali Mehta</h4>
                  <p className="text-sm text-gray-300">Wedding Planner</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <div className="flex items-center space-x-1 text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p className="italic mb-4">
                "As a corporate event manager, I've tried many platforms, but EventHub
                offers the best combination of features and ease of use for business meetings."
              </p>
              <div className="flex items-center">
                <div className="mr-3 bg-gray-300 rounded-full w-10 h-10 flex items-center justify-center text-eventhub-purple-darker font-bold">
                  RK
                </div>
                <div>
                  <h4 className="font-bold">Rajiv Kumar</h4>
                  <p className="text-sm text-gray-300">Corporate Event Manager</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <div className="flex items-center space-x-1 text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p className="italic mb-4">
                "I organized a tech conference for 500+ attendees, and EventHub handled
                everything perfectly from registrations to payments. Highly recommended!"
              </p>
              <div className="flex items-center">
                <div className="mr-3 bg-gray-300 rounded-full w-10 h-10 flex items-center justify-center text-eventhub-purple-darker font-bold">
                  PS
                </div>
                <div>
                  <h4 className="font-bold">Priya Singh</h4>
                  <p className="text-sm text-gray-300">Tech Conference Organizer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold font-heading mb-4">
            Ready to Create Your Next Event?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Join thousands of event organizers who trust EventHub for their event management needs
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Button 
              asChild
              size="lg" 
              className="bg-eventhub-purple hover:bg-eventhub-purple-dark"
            >
              <Link to="/create">Create Your Event</Link>
            </Button>
            <Button 
              asChild
              size="lg" 
              variant="outline" 
              className="border-eventhub-purple text-eventhub-purple hover:bg-eventhub-purple hover:text-white"
            >
              <Link to="/browse">Browse Events</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
