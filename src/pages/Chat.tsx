import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { useAuthStore } from '../store/authStore';
import { Building2 } from 'lucide-react';
import { ChatProperties } from '../components/chat/ChatProperties';
import { ChatInterface } from '../components/chat/ChatInterface';
import { ChatHistory } from '../components/chat/ChatHistory';


export function Chat() {
  const location = useLocation();
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState<string | undefined>(
    location.state?.initialQuery || (chatId ? undefined : "##**HouseGPT**#")
  );
  // Add a ref to track if we've handled initial navigation
  const initialNavigationHandled = React.useRef(false);

  const { user } = useAuthStore()

  // useEffect(() => {
  //   // If we have a chat ID, load that chat
  //   if (chatId) {
  //     loadChatById(chatId);
  //     // If chat ID exists, we've already handled initial navigation
  //     initialNavigationHandled.current = true;
  //   } 
  //   // If we have an initial query from location state and no chatId, create a new chat
  //   // BUT only do this once
  //   else if (location.state?.initialQuery && !initialNavigationHandled.current) {
  //     initialNavigationHandled.current = true;
  //     createNewChat(location.state.initialQuery);
  //   }
  // }, [chatId, location.state]);

  useEffect(() => {
    // If we have a chat ID, load that chat
    if (chatId) {
      loadChatById(chatId);
      // Don't set initialNavigationHandled here - wait until after chat is loaded
    }
    // If we have an initial query from location state and no chatId, create a new chat
    // BUT only do this once
    else if (location.state?.initialQuery && !initialNavigationHandled.current) {
      initialNavigationHandled.current = true;
      createNewChat(location.state.initialQuery);
    }
  }, [chatId, location.state]);


  const loadChatById = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      let query = supabase
        .from('chat_history')
        .select('title')
        .eq('id', id);

      if (session?.user) {
        query = query.eq('user_id', session.user.id);
      } else {
        // For non-authenticated users, we'd use local storage instead
        const localChats = JSON.parse(localStorage.getItem('chat_history') || '[]');
        const chat = localChats.find((c: any) => c.id === id);
        if (chat) {
          setInitialQuery(chat.title);
        } else {
          navigate('/');
        }
        return;
      }

      const { data, error } = await query.single();

      if (error || !data) {
        console.error('Error loading chat:', error);
        navigate('/');
        return;
      }

      setInitialQuery(data.title);

    } catch (error) {
      console.error('Error loading chat:', error);
      navigate('/');
    }
  };

  const createNewChat = async (query: string) => {
    try {
      const chatId = uuidv4();
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Create a new chat in Supabase
        await supabase
          .from('chat_history')
          .insert({
            id: chatId,
            title: query.substring(0, 100), // Use first 100 chars as title
            user_id: session.user.id
          });
      } else {
        // Store in local storage for non-authenticated users
        const localChats = JSON.parse(localStorage.getItem('chat_history') || '[]');
        localChats.unshift({
          id: chatId,
          title: query.substring(0, 100),
          created_at: new Date().toISOString()
        });
        localStorage.setItem('chat_history', JSON.stringify(localChats));
      }

      // Navigate to the new chat
      navigate(`/chat/${chatId}`, {
        replace: true,
        state: { initialQuery: query }
      });
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] relative">
      <div className="absolute top-2 left-2 z-40">
        {user && <button
          onClick={() => setIsHistoryOpen(true)}
          className="p-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-md hover:bg-gray-100"
        >
          <Menu size={18} />
        </button>}
      </div>

      <div className="absolute top-2 right-2 z-40">
        {user && <button
          onClick={() => setIsPropertiesOpen(true)}
          className="p-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-md hover:bg-gray-100"
        >
          <Building2 size={18} />
        </button>}
      </div>

      <ChatHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        currentChatId={chatId}
      />

      <ChatProperties
        isOpen={isPropertiesOpen}
        onClose={() => setIsPropertiesOpen(false)}
        currentChatId={chatId}
      />

      <ChatInterface
        initialQuery={initialQuery}
        chatId={chatId}
        onNewChat={(query: string) => createNewChat(query)}
        shouldSendInitialQuery={!chatId || !initialNavigationHandled.current} // Only send for new chats
      />
    </div>
  );
}