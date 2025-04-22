import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { PropertyChatDialog } from './PropertyChatDialog';
import { Property } from '../../types';
import { BookingCalendar } from '../property/BookingCalendar';
import { VirtualTour } from '../property/VirtualTour';


interface PropertyChatButtonProps {
  property: Property;
}

export function PropertyChatButton({ property }: PropertyChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showVirtualTour, setShowVirtualTour] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const chatButtonRef = useRef<HTMLButtonElement | null>(null);

  const mockProperty = {
    phoneNumber: "+918104286098",
    brochureUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    tourId: "roWLLMMmPL8" // Matterport tour ID
  };

  useEffect(() => {
    if (isOpen || showCalendar || showVirtualTour) {
      document.body.style.overflow = 'hidden';
      if (isOpen) closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = 'auto';
      chatButtonRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, showCalendar, showVirtualTour]);

  const handleCall = () => {
    window.open(`tel:${mockProperty.phoneNumber}`, '_self');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = mockProperty.brochureUrl;
    link.download = 'Property-Brochure.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBookVisit = () => {
    setShowCalendar(true);
  };

  const handleVirtualTour = () => {
    setShowVirtualTour(true);
  };

  const handleBookingConfirmed = (bookingDetails: any) => {
    // You can handle the booking confirmation here, e.g. send to API
    console.log('Booking confirmed:', bookingDetails);
    // Show a success message or notification to the user
  };

  return (
    <>
      {/* Action Buttons */}
      <div className='fixed flex flex-row justify-between bottom-3 left-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full w-1/2 max-w-[188px] p-2 z-40'>
        <button
          onClick={handleCall}
          className="p-2.5 py-1.5 bg-white text-blue-500 rounded-full shadow-lg"
          aria-label="Call the agent"
        >
          <i className="fas fa-phone"></i>
        </button>

        <button
          onClick={handleBookVisit}
          className="px-[11px] py-1.5 bg-white text-blue-500 rounded-full shadow-lg"
          aria-label="Book a visit"
        >
          <i className="fas fa-calendar"></i>
        </button>

        <button
          onClick={handleDownload}
          className="p-2.5 py-1.5 bg-white text-blue-500 rounded-full shadow-lg"
          aria-label="Download brochure"
        >
          <i className="fas fa-download"></i>
        </button>

        <button
          onClick={handleVirtualTour}
          className="p-2.5 py-1.5 bg-white text-blue-500 rounded-full shadow-lg"
          aria-label="Virtual tour"
        >
          <i className="fas fa-vr-cardboard"></i>
        </button>
      </div>

      {/* Chat Button */}
      <button
        ref={chatButtonRef}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-3 right-3 p-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors z-40"
        aria-label="Chat about this property"
        aria-expanded={isOpen}
        aria-controls="property-chat-dialog"
      >
        <div className="relative w-8 h-8">
          <img
            src="https://i.postimg.cc/cHgZjqp8/output-onlinepngtools.png"
            alt="HouseGPT"
          />
        </div>
        <span className="absolute top-0 right-0 flex size-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex size-3 rounded-full bg-red-500"></span>
        </span>
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          id="property-chat-dialog"
        >
          <div className="bg-white w-full max-w-lg rounded-lg sm:rounded-lg shadow-xl flex flex-col h-[600px] max-h-[80vh]">
            {/* Modal Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img
                  src={property.imageUrl}
                  alt={property.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{property.title}</h3>
                  <p className="text-sm text-gray-500 truncate">{property.location}</p>
                </div>
              </div>
              <button
                ref={closeButtonRef}
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
                aria-label="Close chat dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <PropertyChatDialog property={property} />
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <BookingCalendar 
            propertyTitle={property.title}
            onClose={() => setShowCalendar(false)}
            onBookingConfirmed={handleBookingConfirmed}
          />
        </div>
      )}

      {/* Virtual Tour Modal */}
      {showVirtualTour && (
        <VirtualTour 
          propertyTitle={property.title}
          onClose={() => setShowVirtualTour(false)}
          tourId={mockProperty.tourId}
        />
      )}
    </>
  );
}