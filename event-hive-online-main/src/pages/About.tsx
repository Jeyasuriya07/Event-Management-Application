import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold font-heading mb-4">About EventHub</h1>
            <p className="text-lg text-gray-600">
              Your complete solution for event management, registration, and ticketing
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-12">
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6">Our Mission</h2>
              <p className="text-gray-600 mb-6">
                At EventHub, we believe that organizing events should be simple and stress-free. 
                Our mission is to provide an all-in-one platform that makes event creation, 
                promotion, and management accessible to everyone, from individual hosts to 
                large organizations.
              </p>
              <p className="text-gray-600">
                Whether you're planning a wedding, business meeting, casual party, or professional 
                conference, EventHub offers the tools and support you need to create memorable experiences 
                for your attendees.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-6">Features</h2>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-eventhub-purple mr-2">•</span>
                    <span>Easy event creation and customization</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-eventhub-purple mr-2">•</span>
                    <span>Secure online payments and ticketing</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-eventhub-purple mr-2">•</span>
                    <span>Attendee registration and management</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-eventhub-purple mr-2">•</span>
                    <span>Multiple payment options (GPay, UPI, Card)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-eventhub-purple mr-2">•</span>
                    <span>Event history and tracking</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-6">Event Types</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-md p-4">
                    <div className="text-3xl mb-2">💍</div>
                    <h3 className="font-semibold mb-1">Wedding</h3>
                    <p className="text-sm text-gray-500">₹5,000</p>
                  </div>
                  <div className="border border-gray-200 rounded-md p-4">
                    <div className="text-3xl mb-2">💼</div>
                    <h3 className="font-semibold mb-1">Business Meeting</h3>
                    <p className="text-sm text-gray-500">₹1,500</p>
                  </div>
                  <div className="border border-gray-200 rounded-md p-4">
                    <div className="text-3xl mb-2">🎉</div>
                    <h3 className="font-semibold mb-1">Party</h3>
                    <p className="text-sm text-gray-500">₹3,000</p>
                  </div>
                  <div className="border border-gray-200 rounded-md p-4">
                    <div className="text-3xl mb-2">🎤</div>
                    <h3 className="font-semibold mb-1">Conference</h3>
                    <p className="text-sm text-gray-500">₹7,000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-eventhub-purple text-white rounded-lg shadow-md overflow-hidden mb-12">
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Create Your Event?</h2>
              <p className="text-white/80 mb-6">
                Join thousands of event organizers who trust EventHub for their event management needs
              </p>
              <Button asChild className="bg-white text-eventhub-purple hover:bg-gray-100">
                <Link to="/create">Get Started</Link>
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
              <p className="text-gray-600 mb-6">
                Have questions or need assistance? We're here to help! 
                Reach out to our support team at:
              </p>
              <div className="flex flex-col space-y-2 text-gray-600">
                <p><strong>Email:</strong> support@eventhub.com</p>
                <p><strong>Phone:</strong> +1 (234) 567-890</p>
                <p><strong>Hours:</strong> Monday to Friday, 9am to 6pm</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
