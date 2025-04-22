interface OfferCardProps {
    offer: {
      title: string;
      description: string;
      validUntil: string;
      discount: string;
      code: string;
    };
  }
  
  export function OfferCard({ offer }: OfferCardProps) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-md overflow-hidden mb-4 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold mb-2">{offer.title}</h3>
            <p className="mb-4 opacity-90">{offer.description}</p>
            <div className="text-sm opacity-75">Valid until: {offer.validUntil}</div>
          </div>
          <div className="text-3xl font-bold">{offer.discount}</div>
        </div>
        <div className="mt-4 bg-white bg-opacity-20 rounded p-2 text-center">
          <span className="text-sm">Use code:</span>
          <span className="ml-2 font-mono font-bold">{offer.code}</span>
        </div>
      </div>
    );
  }