import { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Message, Property } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import { SmallPropertyCard } from '../property/SmallPropertyCard';

interface ChatPropertiesProps {
    isOpen: boolean;
    onClose: () => void;
    currentChatId?: string;
}

export function ChatProperties({ isOpen, onClose, currentChatId }: ChatPropertiesProps) {
    const [properties, setProperties] = useState<Property[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [visibleProperties, setVisibleProperties] = useState<Property[]>([]);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const propertyRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    // Fetch chat history from Supabase
    useEffect(() => {
        async function fetchChatHistory() {
            if (!currentChatId) return;
            
            setIsLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                let chatMessages: Message[] = [];

                if (session?.user) {
                    const { data, error } = await supabase
                        .from('chat_messages')
                        .select('*')
                        .eq('chat_id', currentChatId)
                        .order('created_at', { ascending: true });

                    if (error) throw error;

                    if (data) {
                        chatMessages = data.map(msg => ({
                            id: msg.message_id,
                            content: msg.content,
                            role: msg.role as 'user' | 'assistant',
                            properties: msg.properties || [],
                        }));
                    }
                } else {
                    const localMessages = JSON.parse(localStorage.getItem(`chat_${currentChatId}_messages`) || '[]');
                    chatMessages = localMessages;
                }

                // Flatten and deduplicate properties
                const allProperties: Property[] = chatMessages
                    .flatMap(msg => msg.properties || [])
                    .reduce((acc: Property[], curr: Property) => {
                        if (!acc.some(p => p.id === curr.id)) acc.push(curr);
                        return acc;
                    }, []);

                setProperties(allProperties);
                // Initialize with the first few properties to avoid empty screen
                setVisibleProperties(allProperties.slice(0, 5));
            } catch (error) {
                console.error('Error loading chat history:', error);
                toast.error('Failed to load chat history');
            } finally {
                setIsLoading(false);
            }
        }

        if (isOpen && currentChatId) {
            fetchChatHistory();
        }
    }, [isOpen, currentChatId]);

    // Check which properties are visible in the viewport
    const checkVisibility = useCallback(() => {
        if (!containerRef.current || !properties) return;
        
        const containerRect = containerRef.current.getBoundingClientRect();
        const visibleIds = new Set<string>();
        
        // Calculate which properties are visible
        properties.forEach(property => {
            const element = propertyRefs.current.get(property.id);
            if (!element) return;
            
            const elementRect = element.getBoundingClientRect();
            
            // Check if element is visible in the container
            const isVisible = 
                elementRect.top < containerRect.bottom &&
                elementRect.bottom > containerRect.top;
                
            if (isVisible) {
                visibleIds.add(property.id);
            }
        });
        
        // Find the last visible property index
        let lastVisibleIndex = -1;
        for (let i = 0; i < properties.length; i++) {
            if (visibleIds.has(properties[i].id)) {
                lastVisibleIndex = Math.max(lastVisibleIndex, i);
            }
        }
        
        // Show visible properties plus two more below
        const endIndex = Math.min(lastVisibleIndex + 3, properties.length);
        const startIndex = Math.max(0, lastVisibleIndex - 5);
        
        setVisibleProperties(properties.slice(0, endIndex));
    }, [properties]);

    // Set up scroll event listener
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        
        const handleScroll = () => {
            checkVisibility();
        };
        
        container.addEventListener('scroll', handleScroll);
        
        // Initial check
        checkVisibility();
        
        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, [checkVisibility, properties]);

    // Set ref for each property element
    const setPropertyRef = (id: string, element: HTMLDivElement | null) => {
        if (element) {
            propertyRefs.current.set(id, element);
        } else {
            propertyRefs.current.delete(id);
        }
    };

    return (
        <div className={`fixed inset-y-0 right-0 w-52 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between px-4 py-2.5 border-b">
                    <div className='flex flex-col justify-between'>
                        <h3 className="font-medium">Chat Properties</h3>
                        <p className="text-xs text-blue-500 font-medium">
                            {properties?.length === 1
                                ? '1 property found'
                                : `${properties?.length || 0} properties found`}
                        </p>
                    </div>

                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
                        <X size={18} />
                    </button>
                </div>

                <div ref={containerRef} className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-1 gap-4 justify-center">
                        {isLoading && (
                            <div className="flex justify-center p-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            </div>
                        )}
                        
                        {!isLoading && properties && properties.length > 0 && (
                            <>
                                {/* Render placeholders for proper scrolling height */}
                                <div 
                                    style={{ 
                                        height: properties.length * 100, // Approximate height of all properties
                                        position: 'relative'
                                    }}
                                    className="w-full"
                                >
                                    {/* Only render visible properties */}
                                    {visibleProperties.map((property) => (
                                        <div 
                                            key={property.id}
                                            ref={(el) => setPropertyRef(property.id, el)}
                                            className="mb-4"
                                        >
                                            <SmallPropertyCard propertyId={property.id} />
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        
                        {!isLoading && (!properties || properties.length === 0) && (
                            <p className="text-gray-500 text-sm">No properties found in this chat.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}