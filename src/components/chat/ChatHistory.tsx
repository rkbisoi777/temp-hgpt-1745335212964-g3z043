import React, { useState, useEffect } from 'react';
import { X, PlusCircle, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../lib/supabaseClient';
import { ChatHistoryService } from '../../lib/chatHistoryService';

interface ChatHistoryItem {
    id: string;
    title: string;
    created_at: string;
}

interface ChatHistoryProps {
    isOpen: boolean;
    onClose: () => void;
    currentChatId?: string;
}

export function ChatHistory({ isOpen, onClose, currentChatId }: ChatHistoryProps) {
    const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    

    // Fetch chat history from Supabase
    useEffect(() => {
        async function fetchChatHistory() {
            setIsLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();

                // If user is authenticated, fetch their chats
                if (session?.user) {
                    const { data, error } = await supabase
                        .from('chat_history')
                        .select('id, title, created_at')
                        .eq('user_id', session.user.id)
                        .order('created_at', { ascending: false });

                    if (error) throw error;
                    setChatHistory(data || []);
                } else {
                    // For non-authenticated users, use local storage to get chat history
                    const localChats = localStorage.getItem('chat_history');
                    setChatHistory(localChats ? JSON.parse(localChats) : []);
                }
            } catch (error) {
                console.error('Error fetching chat history:', error);
            } finally {
                setIsLoading(false);
            }
        }

        if (isOpen) {
            fetchChatHistory();
        }
    }, [isOpen]);

    // const handleNewChat = async () => {
    //     const { data: { session } } = await supabase.auth.getSession();
    
    //     if (session?.user) {
    //         try {
    //             const newChat = await ChatHistoryService.createChat(session.user.id, 'New Chat');
    //             console.log('New chat created:', newChat);
    
    //             navigate(`/chat/${newChat.id}`, {
    //                 replace: true,
    //                 state: { initialQuery: '##**HouseGPT**#' },
    //             });
    
    //             onClose();
    //         } catch (err) {
    //             console.error('Failed to create chat:', err);
    //         }
    //     }
    // };

    const handleNewChat = async (query: string) => {
    
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

           // Close the sidebar
           onClose();

           // Wait a short moment, then reload the page
           window.location.reload();
          
    
        } catch (error) {
          console.error('Error creating chat:', error);
        }
      };
    

    const handleSelectChat = (chatId: string) => {
        navigate(`/chat/${chatId}`);
        onClose();
    };

    const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();

        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                // Delete from Supabase
                await ChatHistoryService.deleteChat(chatId)
            } else {
                // Delete from local storage
                const updatedChats = chatHistory.filter(chat => chat.id !== chatId);
                localStorage.setItem('chat_history', JSON.stringify(updatedChats));
                setChatHistory(updatedChats);
            }

            // If we deleted the current chat, go to home
            if (chatId === currentChatId) {
                navigate('/', { replace: true });
            }

            // Refresh the list
            setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
        } catch (error) {
            console.error('Error deleting chat:', error);
        }
    };

    return (
        <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-medium">Chat History</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
                        <X size={18} />
                    </button>
                </div>

                <button
                    onClick={()=> handleNewChat('##**HouseGPT**#')}
                    className="flex items-center gap-2 m-3 p-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                    <PlusCircle size={18} />
                    <span>New Chat</span>
                </button>

                <div className="flex-1 overflow-y-auto p-2">
                    {isLoading ? (
                        <div className="flex justify-center p-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        </div>
                    ) : chatHistory.length === 0 ? (
                        <p className="text-gray-500 text-center p-4 text-sm">No chat history found</p>
                    ) : (
                        <ul className="space-y-1">
                            {chatHistory.map((chat) => (
                                <li
                                    key={chat.id}
                                    onClick={() => handleSelectChat(chat.id)}
                                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-100 ${currentChatId === chat.id ? 'bg-gray-100' : ''}`}
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        <MessageSquare size={16} className="text-gray-500" />
                                        <span className="truncate text-sm">{chat.title}</span>
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteChat(e, chat.id)}
                                        className="p-1 rounded-full hover:bg-gray-200 opacity-0 group-hover:opacity-100"
                                    >
                                        <X size={14} className="text-gray-500" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}