
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import EventForm from "@/components/events/EventForm";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/auth/AuthModal";
import { useState, useEffect } from "react";

export default function CreateEvent() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [returnPath, setReturnPath] = useState("/");

  // Save the current path for after authentication
  useEffect(() => {
    setReturnPath(window.location.pathname);
  }, []);

  // Handle successful authentication
  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Don't need to navigate as the component will re-render with currentUser
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-eventhub-purple p-6">
              <h1 className="text-2xl md:text-3xl font-bold text-white">Create Your Event</h1>
              <p className="text-white/80 mt-2">
                Fill out the form below to create and publish your event
              </p>
            </div>
            
            <div className="p-6">
              {currentUser ? (
                <EventForm />
              ) : (
                <div className="text-center py-12">
                  <h2 className="text-xl font-semibold mb-4">
                    You need to be logged in to create an event
                  </h2>
                  <p className="text-gray-500 mb-6">
                    Please sign in or create an account to continue
                  </p>
                  <Button 
                    onClick={() => setShowAuthModal(true)}
                    className="bg-eventhub-purple hover:bg-eventhub-purple-dark"
                  >
                    Sign In / Create Account
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/")} 
                    className="ml-3"
                  >
                    Back to Home
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 bg-eventhub-orange/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-eventhub-orange mb-2">
              Event Creation Tips
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-eventhub-orange mr-2">•</span>
                <span>Choose a catchy, descriptive name for your event</span>
              </li>
              <li className="flex items-start">
                <span className="text-eventhub-orange mr-2">•</span>
                <span>Add a detailed description to attract more attendees</span>
              </li>
              <li className="flex items-start">
                <span className="text-eventhub-orange mr-2">•</span>
                <span>Upload a high-quality image to make your event stand out</span>
              </li>
              <li className="flex items-start">
                <span className="text-eventhub-orange mr-2">•</span>
                <span>Set an appropriate ticket count based on your venue capacity</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}
