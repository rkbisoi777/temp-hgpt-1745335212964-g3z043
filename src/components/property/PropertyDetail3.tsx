import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import { usePropertyStore } from '../../store/propertyStore';
import { Property, PropertyImageMetadata } from '../../types';
import { FetchDetailsError, FetchDetailsResult, fetchPropertyDetails } from '../../lib/property-detail';
import { convertToCroreAndLakh, generateSlug } from '../../lib/utils';
import { fetchPropertyImages } from '../../utils/propertyUtils';

// Lazy load all components
const PropertyStats = lazy(() => import('./PropertyStats').then(module => ({ default: module.PropertyStats })));
const PropertyHeader = lazy(() => import('./PropertyHeader').then(module => ({ default: module.PropertyHeader })));
const PropertyActions = lazy(() => import('./PropertyActions').then(module => ({ default: module.PropertyActions })));
const PropertyGraph = lazy(() => import('../report/PropertyGraph').then(module => ({ default: module.PropertyGraph })));
const PropertyDescriptionCard = lazy(() => import('../report/PropertyDescriptionCard').then(module => ({ default: module.PropertyDescriptionCard })));
const PropertyTabs = lazy(() => import('./PropertyTabs').then(module => ({ default: module.PropertyTabs })));
const PropertyGallery = lazy(() => import('./PropertyGallery'));
const OverviewCard = lazy(() => import('../report/OverviewCardProps'));
const FloorPlan = lazy(() => import('../report/FloorPlan'));
const Amenities = lazy(() => import('../report/Amenities'));
const FAQ = lazy(() => import('../report/FAQ'));
const PropertyChatButton = lazy(() => import('../chat/PropertyChatButton').then(module => ({ default: module.PropertyChatButton })));
const NeighborhoodMap = lazy(() => import('./NeighborhoodMap').then(module => ({ default: module.NeighborhoodMap })));
const PropertyScore = lazy(() => import('../report/PropertyScore').then(module => ({ default: module.PropertyScore })));
const LocationOverview = lazy(() => import('../report/LocationOverview'));
const DeveloperOverview = lazy(() => import('../report/DeveloperOverview'));
const PropertyOverview = lazy(() => import('../report/PropertyOverview'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-4 h-40">
    <div className="animate-pulse text-gray-500">Loading...</div>
  </div>
);

export function PropertyDetail() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getPropertyById } = usePropertyStore();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('OverviewCard');
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [propertyOverview, setPropertyOverview] = useState<FetchDetailsResult>();
  const [propertyOverviewString, setPropertyOverviewString] = useState<string>();
  const [metaDescription, setMetaDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');

  // Section Refs
  const graphRef = useRef<HTMLDivElement | null>(null);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const overviewRef = useRef<HTMLDivElement | null>(null);
  const descriptionRef = useRef<HTMLDivElement | null>(null);
  const floorPlanRef = useRef<HTMLDivElement | null>(null);
  const locationOverviewRef = useRef<HTMLDivElement | null>(null);
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const amenitiesRef = useRef<HTMLDivElement | null>(null);
  const faqRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const scoreRef = useRef<HTMLDivElement | null>(null);
  const [propertyImages, setPropertyImages] = useState<PropertyImageMetadata[]>([]);

  // Mock data import using dynamic import
  const [mockPriceTendData, setMockPriceTendData] = useState([]);

  useEffect(() => {
    const loadMockData = async () => {
      const { default: data } = await import('../../mockData/priceTendData');
      setMockPriceTendData(data);
    };
    loadMockData();
  }, []);

  // Track all section refs in a map for easy access
  const sectionRefs = {
    OverviewCard: overviewRef,
    FloorPlan: floorPlanRef,
    LocationOverview: locationOverviewRef,
    NeighborhoodMap: mapRef,
    PropertyGallery: galleryRef,
    Amenities: amenitiesRef,
    FAQ: faqRef,
    PropertyGraph: graphRef,
    LocalityStats: statsRef
  };

  // SEO - Redirect to the canonical URL with slug if needed
  useEffect(() => {
    if (property && id) {
      const propertySlug = generateSlug(`${property.title}-${property.location}-${property.bedrooms_min}-${property.bedrooms_max}-BHK`);
      const correctPath = `/property/${id}/${propertySlug}`;
      
      // If we're on a path without a slug or with an incorrect slug, redirect to the canonical URL
      if (location.pathname !== correctPath) {
        navigate(correctPath, { replace: true });
      }
      
      // Set canonical URL
      setCanonicalUrl(`${window.location.origin}${correctPath}`);
    }
  }, [property, id, location.pathname, navigate]);

  useEffect(() => {
    const fetchProperty = async () => {
      if (id) {
        try {
          const data = await getPropertyById(id);
          if (data) {
            const images = await fetchPropertyImages(id);
            setPropertyImages(images);

            setProperty({
              ...data,
              id: data.id,
              title: data.title,
              price_min: data.price_min,
              price_max: data.price_max,
              location: data.location,
              bedrooms_min: data.bedrooms_min,
              bedrooms_max: data.bedrooms_max,
              sqft_min: data.sqft_min,
              sqft_max: data.sqft_max,
              description: data.description,
              latitude: data.latitude,
              longitude: data.longitude,
              developer_name: data.developer_name,
              area: data.area,
              ai_overview: data.ai_overview,
              amenities: data.amenities
            });

            // Create SEO meta description from property data
            const priceRange = data.price_min === data.price_max 
              ? `₹${convertToCroreAndLakh(data.price_min)}` 
              : `₹${convertToCroreAndLakh(data.price_min)} - ₹${convertToCroreAndLakh(data.price_max)}`;
            
            const sizeRange = data.sqft_min === data.sqft_max
              ? `${data.sqft_min} sq.ft.`
              : `${data.sqft_min} - ${data.sqft_max} sq.ft.`;
            
            const bedroomsRange = data.bedrooms_min === data.bedrooms_max
              ? `${data.bedrooms_min} BHK`
              : `${data.bedrooms_min} - ${data.bedrooms_max} BHK`;
            
            setMetaDescription(
              `${data.title} in ${data.location} - ${bedroomsRange} apartments of ${sizeRange} at ${priceRange}. Developed by ${data.developer_name}, possession starting ${data.possession_start}.`
            );

            if (data.ai_overview === null || data.ai_overview === '') {
              try {
                const propOverview: FetchDetailsResult | FetchDetailsError = await fetchPropertyDetails({
                  ...data,
                  id: data.id,
                  title: data.title,
                  price_min: data.price_min,
                  price_max: data.price_max,
                  location: data.location,
                  bedrooms_min: data.bedrooms_min,
                  bedrooms_max: data.bedrooms_max,
                  sqft_min: data.sqft_min,
                  sqft_max: data.sqft_max,
                  description: data.description,
                  latitude: data.latitude,
                  longitude: data.longitude,
                  developer_name: data.developer_name,
                  area: data.area
                });
                setPropertyOverview(propOverview as FetchDetailsResult)
                setPropertyOverviewString(JSON.stringify(propOverview))
              } catch (e) {
                console.error('Error fetching property overview from Gemini:', e);
              }
            } else {
              setPropertyOverview(JSON.parse(data.ai_overview) as FetchDetailsResult)
              setPropertyOverviewString(data.ai_overview)
            }
          }
        } catch (error) {
          console.error('Error fetching property:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProperty();
  }, [id, getPropertyById]);

  useEffect(() => {
    if (propertyImages) {
      const images = Object.values(propertyImages).filter(Boolean);
      if (images.length > 0) {
        const interval = setInterval(() => {
          setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000);
        return () => clearInterval(interval);
      }
    }
  }, [propertyImages]);

  // Set up Intersection Observer to track which section is visible
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50% 0px', 
      threshold: 0.05 
    };

    // Create observers for each section
    Object.entries(sectionRefs).forEach(([tabId, ref]) => {
      if (ref.current) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setActiveTab(tabId);
            }
          });
        }, observerOptions);

        observer.observe(ref.current);
        observers.push(observer);
      }
    });

    // Clean up observers on component unmount
    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, [property]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-gray-50 rounded-full flex items-center justify-start min-w-8 gap-2">
          {['-0.3s', '-0.15s', '0s'].map((delay, index) => (
            <div key={index} className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center p-1 animate-bounce" style={{ animationDelay: delay }}>
              <img src="https://i.postimg.cc/cHgZjqp8/output-onlinepngtools.png" alt="HouseGPT" className="w-4 h-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Property not found</div>
      </div>
    );
  }

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    const ref = sectionRefs[tab as keyof typeof sectionRefs];
    ref?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Generate structured data for rich snippets
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": property.title,
    "description": metaDescription,
    "image": propertyImages.length > 0 ? propertyImages[0].public_url : "",
    "brand": {
      "@type": "Brand",
      "name": property.developer_name
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "INR",
      "lowPrice": property.price_min,
      "highPrice": property.price_max,
      "offerCount": 1
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": property.location
    }
  };

  // Create breadcrumb structured data
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": window.location.origin
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Properties",
        "item": `${window.location.origin}/properties`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": property.location,
        "item": `${window.location.origin}/properties?location=${encodeURIComponent(property.location)}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": property.title,
        "item": canonicalUrl
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{property.title} | {property.location} | {property.bedrooms_min.toString()}-{property.bedrooms_max.toString()} BHK Properties</title>
        {/* <title>{property.title} | {property.location} </title> */}
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={`${property.title}, ${property.location}, ${property.bedrooms_min} BHK, ${property.bedrooms_max} BHK, real estate, property, ${property.developer_name}`} />
        
        {/* Open Graph tags for social sharing */}
        <meta property="og:title" content={`${property.title} | ${property.location}`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={canonicalUrl} />
        {propertyImages.length > 0 && <meta property="og:image" content={propertyImages[0].public_url} />}
        <meta property="og:site_name" content="HouseGPT" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${property.title} | ${property.location}`} />
        <meta name="twitter:description" content={metaDescription} />
        {propertyImages.length > 0 && <meta name="twitter:image" content={propertyImages[0].public_url} />}
        
        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Structured data for rich snippets */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbData)}
        </script>
      </Helmet>

      <div className="max-w-full mx-auto p-4 space-y-6 px-5">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-start">
              <button
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="md:text-2xl sm:text-xl text-xl font-bold break-words ml-2">{property.title}</h1>
            </div>
          </div>
          
          <Suspense fallback={<div className="h-8 w-20 bg-gray-100 animate-pulse rounded"></div>}>
            <PropertyActions property={property} />
          </Suspense>
        </div>

        <div className="aspect-video w-full max-h-[400px] md:max-h-[550px] lg:max-h-[720px] rounded-lg overflow-hidden border border-gray-300">
          <div className="relative w-full h-full">
            {propertyImages.map((image, index) => (
              <div key={image.id} className="absolute top-0 left-0 w-full h-full">
                <img
                  src={image.public_url || ''}
                  alt={image.label || `${property.title} - ${property.location} - Image ${index + 1}`}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                  loading={index === 0 ? "eager" : "lazy"}
                />
                {index === currentImageIndex && image.label && (
                  <div className="absolute top-2 right-2 text-white text-[10px] font-semibold bg-black bg-opacity-50 rounded-xl px-1.5 py-0.5">
                    {image.label}
                  </div>
                )}
              </div>
            ))}
            <div className="absolute bottom-2 right-2 text-white text-[10px] font-semibold bg-black bg-opacity-50 rounded-xl px-1.5 py-0.5">
              {currentImageIndex + 1}/{propertyImages.length}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Suspense fallback={<LoadingFallback />}>
            <PropertyHeader property={property} />
          </Suspense>
        </div>

        <div className="sticky top-16 z-50 bg-white rounded-md shadow-md">
          <Suspense fallback={<div className="h-12 bg-gray-100 animate-pulse rounded"></div>}>
            <PropertyTabs activeTab={activeTab} onTabClick={handleTabClick} />
          </Suspense>
        </div>

        <div>
          <div ref={scoreRef}>
            <Suspense fallback={<LoadingFallback />}>
              <PropertyScore propertyScore={(propertyOverview as unknown as FetchDetailsResult)?.propertyScores} />
            </Suspense>
          </div>
          <div ref={descriptionRef}>
            <Suspense fallback={<LoadingFallback />}>
              <PropertyOverview property={property} propertyOverview={propertyOverview?.propertyDetails?.propertyOverview || ''} />
            </Suspense>
          </div>
          <div ref={overviewRef}>
            <Suspense fallback={<LoadingFallback />}>
              <OverviewCard
                projectName={property.title}
                projectArea={` ${property.area} acres`}
                sizes={`${property.sqft_min} - ${property.sqft_max} sq.ft.`}
                projectSize="2 Buildings - 760 units"
                launchDate={`${property.launch_date}`}
                avgPrice={`${convertToCroreAndLakh(property.avg_price)}`}
                possessionStarts={`${property.possession_start}`}
                configurations="1, 2 BHK Apartments"
                reraId={property.RERA}
              />
            </Suspense>
          </div>

          <div ref={floorPlanRef}>
            <Suspense fallback={<LoadingFallback />}>
              <FloorPlan />
            </Suspense>
          </div>

          <div ref={mapRef}>
            <Suspense fallback={<LoadingFallback />}>
              <LocationOverview location={property.location} locationOverview={propertyOverview?.locationDetails?.locationOverview || ''} />
            </Suspense>
            <Suspense fallback={<LoadingFallback />}>
              <NeighborhoodMap
                latitude={property.latitude || 19.0760}
                longitude={property.longitude || 72.8777}
                propertyTitle={property.title}
              />
            </Suspense>
          </div>

          <div ref={galleryRef}>
            <Suspense fallback={<LoadingFallback />}>
              <PropertyGallery images={[]} />
            </Suspense>
          </div>

          <div ref={amenitiesRef}>
            <Suspense fallback={<LoadingFallback />}>
              <Amenities amenitiesList={property.amenities} />
            </Suspense>
          </div>

          <div ref={graphRef}>
            <Suspense fallback={<LoadingFallback />}>
              <PropertyGraph propertyId={property.id} data={mockPriceTendData} />
            </Suspense>
          </div>

          <div ref={faqRef}>
            <Suspense fallback={<LoadingFallback />}>
              <DeveloperOverview devloperOverview={propertyOverview?.developerDetails?.developerOverview || ''} developer={property.developer_name} />
            </Suspense>
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <PropertyChatButton property={property} />
      </Suspense>
    </>
  );
}