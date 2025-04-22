import { X } from 'lucide-react';

interface VirtualTourProps {
  propertyTitle: string;
  onClose: () => void;
  tourId?: string;
}

export function VirtualTour({ propertyTitle, onClose, tourId = "roWLLMMmPL8" }: VirtualTourProps) {
  // Construct the Matterport URL with the provided tour ID
  const matterportUrl = `https://my.matterport.com/show?play=1&lang=en-US&m=${tourId}`;

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      <div className="p-2 flex justify-between items-center bg-gradient-to-r from-cyan-400 to-blue-500">
        <div className="flex flex-col justify-between">
          <p className="ml-1 text-md font-semibold text-white">{propertyTitle}</p>
        </div>

        <button
          onClick={onClose}
          className="p-1 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Close virtual tour"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <iframe
          title="Virtual Tour"
          width="100%"
          height="100%"
          src={matterportUrl}
          allowFullScreen
          className="border-0"
        ></iframe>
      </div>
    </div>
  );
}