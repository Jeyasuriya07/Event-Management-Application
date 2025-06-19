
import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-eventhub-purple-darker text-white">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">
              Event<span className="text-eventhub-orange">Hub</span>
            </h3>
            <p className="text-gray-300">
              Your complete solution for event management, registration, and ticketing. Create, organize, and promote your events with ease.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/browse" className="text-gray-300 hover:text-white transition-colors">Browse Events</Link>
              </li>
              <li>
                <Link to="/create" className="text-gray-300 hover:text-white transition-colors">Create Event</Link>
              </li>
              <li>
                <Link to="/history" className="text-gray-300 hover:text-white transition-colors">My Events</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link>
              </li>
            </ul>
          </div>

          {/* Event Types */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Event Types</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/browse?type=Wedding" className="text-gray-300 hover:text-white transition-colors">Wedding</Link>
              </li>
              <li>
                <Link to="/browse?type=Business Meeting" className="text-gray-300 hover:text-white transition-colors">Business Meeting</Link>
              </li>
              <li>
                <Link to="/browse?type=Party" className="text-gray-300 hover:text-white transition-colors">Party</Link>
              </li>
              <li>
                <Link to="/browse?type=Conference" className="text-gray-300 hover:text-white transition-colors">Conference</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-300">
                <Mail size={16} className="mr-2" />
                <a href="mailto:info@eventhub.com" className="hover:text-white transition-colors">
                  info@eventhub.com
                </a>
              </li>
              <li className="flex items-center text-gray-300">
                <Phone size={16} className="mr-2" />
                <a href="tel:+1234567890" className="hover:text-white transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>© {currentYear} EventHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
