import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TabSelector } from '../components/TabSelector';
import { SearchTab } from '../components/SearchTab';
import { PremadeQuestions } from '../components/PremadeQuestions';
import { LocationSelector } from '../components/LocationSelector';
import { Logo } from '../components/home/Logo';
import { propertyService } from '../lib/propertyService';
import { PropertyGrid } from '../components/property/PropertyGrid';
import { HomeChatButton } from '../components/chat/HomeChatButton';
import { Award } from 'lucide-react';
import { Property } from '../types';
import HousingPriceGraph from '../components/PriceIndex';
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { ChatHistoryService } from '../lib/chatHistoryService';
// import { Feed } from '../components/feed/Feed';
import { Calculator } from '../components/Tools';
import { BlogGrid } from '../components/blog/BlogGrid';
import { NewsGrid } from '../components/news/NewsGrid';
import { ChatTab } from '../components/ChatTab';

export function Home() {
  const [activeTab, setActiveTab] = useState<'search' | 'report'>('search');
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);

  const [location, setLocation] = useState("Mumbai");

  // Initial property fetch
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const props: Property[] = await propertyService.searchProperties(location);
        setProperties(props.slice(0, 10));
      } catch (error) {
        console.error("Error fetching properties:", error);

      }
    };

    fetchProperties();
  }, [location]);



  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);

  };

  // const handleSearch = (query: string) => {
  //     // navigate('/chat', { state: { initialQuery: query } });
  //     const chatId = uuidv4();
  //     navigate(`/chat/${chatId}`, {
  //       replace: true,
  //       state: { initialQuery: query }
  //     });
  // };


  const [isNavigating, setIsNavigating] = useState(false);

  // Full implementation of createNewChat with throttling protection
  const createNewChat = async (query: string) => {
    // Prevent multiple rapid calls
    if (isNavigating) return;

    setIsNavigating(true);

    try {
      const chatId = uuidv4();
      const { data: { session } } = await supabase.auth.getSession();

      // First, create the chat history entry
      if (session?.user) {
        // For authenticated users, save to Supabase
        const newChat = await ChatHistoryService.createChat(session.user.id, 'New Chat');

        navigate(`/chat/${newChat.id}`, {
          replace: true,
          state: { initialQuery: query }
        });
      } else {
        // For non-authenticated users, use localStorage
        const localChats = JSON.parse(localStorage.getItem('chat_history') || '[]');
        const newChat = {
          id: chatId,
          title: query.substring(0, 100),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Add the new chat to the beginning of the array
        localChats.unshift(newChat);

        // Keep only the most recent 50 chats to prevent localStorage from getting too large
        const trimmedChats = localChats.slice(0, 50);
        localStorage.setItem('chat_history', JSON.stringify(trimmedChats));

        navigate(`/chat/${chatId}`, {
          replace: true,
          state: { initialQuery: query }
        });
      }

    } catch (error) {
      console.error('Error creating chat:', error);
      // Make sure to reset the flag even if there's an error
      setIsNavigating(false);

      // Optionally show an error message to the user
      // toast.error('Failed to create new chat. Please try again.');
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 w-full">
      {/* <div className="px-4 max-w-5xl"> */}
      <div className="text-center mb-4 mt-[50px]">
        <Logo size={10} layout="col" />
        <p className='text-blue-500 text-sm mt-3 font-medium'>India's First AI-Powered Real Estate Agent & Platform</p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <LocationSelector onLocationChange={handleLocationChange} />
        </div>
      </div>

      <div className="w-full max-w-full">
        <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex items-center justify-center">
          <p className="text-sm text-gray-600 mb-2">
            {activeTab === 'search'
              ? 'Let HouseGPT help you find the perfect match!'
              : 'Discover the best match for your property needs!'}
          </p>
        </div>
        {activeTab === 'search' ? (
          <>
            <div className="bg-transparent">
              <ChatTab onSubmit={createNewChat} />
            </div>
            <PremadeQuestions onQuestionClick={createNewChat} location={location}/>
            <div className="my-4 text-gray-500 z-48">
              <div className="flex items-center gap-1 mb-2 text-gray-600">
                <Award className="w-4 h-4" />
                <span className="text-sm font-semibold">Top Properties in {location}</span>
              </div>

              {properties && <PropertyGrid properties={properties} maxInitialDisplay={8} />}

            </div>
            <Calculator />
            <HousingPriceGraph />
            <BlogGrid/>
            <NewsGrid />
            {/* <Feed location={location} /> */}
          </>
        ) : (
          <>
            {properties &&
              <SearchTab preloadedProperties={properties} />}
          </>
        )}
      </div>
      <HomeChatButton onSubmit={createNewChat} />
      {/* </div> */}
    </div>
  );
}
