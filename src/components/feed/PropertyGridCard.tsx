// import { PropertyCard } from '../property/PropertyCard';
import { SmallPropertyCard } from '../property/SmallPropertyCard';

interface PropertyGridCardProps {
  properties: string[];
}

export function PropertyGridCard({ properties }: PropertyGridCardProps) {
  return (
    <div className="mb-4">
      <div className="grid grid-cols-2 gap-1">
        {properties.slice(0, 4).map((propertyId) => (
          <SmallPropertyCard key={propertyId} propertyId={propertyId} isFeed={true} />
        ))}
      </div>
    </div>
  );
}