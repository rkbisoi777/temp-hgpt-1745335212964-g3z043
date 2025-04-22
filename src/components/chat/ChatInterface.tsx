import { useState, useEffect, useRef } from 'react';
import { Message } from '../../types';
import { ChatService } from '../../lib/chat/langchainChatService';
import { useToken } from '../TokenContext';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabaseClient';
import { generateMessageId } from '../../utils/messageUtils';
import { TokenService } from '../../lib/tokenService';
import { ChatServiceError } from '../../lib/chat/errors';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

const DAILY_LIMIT = 5000;

interface ChatInterfaceProps {
  initialQuery?: string;
  shouldSendInitialQuery?: boolean;
  chatId?: string;
  onNewChat?: (query: string) => void;
}

export function ChatInterface({ initialQuery, shouldSendInitialQuery, chatId, onNewChat }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const initialQueryProcessed = useRef(false);
  const [chatService, setChatService] = useState<ChatService | null>(null);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<string>('');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);

  const { tokens, setTokens } = useToken();

  const getCookie = (name: string): string | null => {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [key, value] = cookie.split('=');
      if (key === name) return decodeURIComponent(value);
    }
    return null;
  };

  const setCookie = (name: string, value: string, days: number): void => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${date.toUTCString()};path=/`;
  };

  useEffect(() => {
    const storedTokens = getCookie('HouseGPTTokens');
    const lastReset = getCookie('lastReset');
    const today = new Date().toISOString().split('T')[0];

    if (!lastReset || lastReset !== today) {
      setCookie('HouseGPTTokens', String(DAILY_LIMIT), 1);
      setCookie('lastReset', today, 1);
      setTokens(DAILY_LIMIT);
    } else if (storedTokens) {
      setTokens(Number(storedTokens));
    }
  }, [setTokens]);

  useEffect(() => {
    const initChatService = async () => {
      try {
        const service = await ChatService.getInstance();
        setChatService(service);
      } catch (error) {
        toast.error('Failed to initialize chat service');
        console.error('Chat service initialization failed:', error);
      }
    };
    initChatService();
  }, []);

  // New effect to load chat history when chatId is available
  useEffect(() => {
    if (chatId && chatService) {
      loadChatHistory(chatId);
    }
  }, [chatId, chatService]);

  const loadChatHistory = async (chatId: string) => {
    try {
      setIsLoadingHistory(true);
      const { data: { session } } = await supabase.auth.getSession();
      let chatMessages: Message[] = [];

      if (session?.user) {
        // For authenticated users, load from Supabase
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (data) {
          chatMessages = data.map(msg => ({
            id: msg.message_id,
            content: msg.content,
            role: msg.role as 'user' | 'assistant',
            properties: msg.properties
          }));
        }
      } else {
        // For non-authenticated users, load from local storage
        const localMessages = JSON.parse(localStorage.getItem(`chat_${chatId}_messages`) || '[]');
        chatMessages = localMessages;
      }

      if (chatMessages.length > 0) {
        setMessages(chatMessages);
      } else if (initialQuery === "##**HouseGPT**#") {
        // Show welcome message if no history and default initialQuery
        setMessages([
          {
            id: generateMessageId(),
            content: `Hi, I'm HouseGPT! I can help you find the perfect property and answer all your real estate questions with personalized recommendations. I can help you with:
                    🏡 Find your dream property
                    📊 Provide accurate property details
                    💰 Share pricing and market trends
                    And much more...
                    What would you like to know?`,
            role: 'assistant',
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast.error('Failed to load chat history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const subtractTokens = async (tokenUsed: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user.id) {
      await TokenService.updateUserTokens(session.user.id, tokenUsed)
    } else {
      const newTokenCount = tokens - tokenUsed;
      if (newTokenCount < 0) {
        setTokens(0);
        setCookie('HouseGPTTokens', String(0), 1);
      } else {
        setTokens(newTokenCount);
        setCookie('HouseGPTTokens', String(newTokenCount), 1);
      }
    }
  };

  // Modified useEffect for initialQuery handling
  useEffect(() => {
    if (initialQuery && !initialQueryProcessed.current && chatService && !isLoadingHistory) {
      initialQueryProcessed.current = true;

      if (initialQuery !== "##**HouseGPT**#" && shouldSendInitialQuery) {
        // Only handle as a new message if shouldSendInitialQuery is true
        if (chatId) {
          handleSendMessage(initialQuery);
        } else if (onNewChat) {
          onNewChat(initialQuery);
        }
      } else if (initialQuery === "##**HouseGPT**#" && messages.length === 0) {
        const msgId = generateMessageId()
        // Only show welcome message if no messages are loaded yet
        setMessages([
          {
            id: msgId,
            content: `Hi, I'm HouseGPT! I can help you find the perfect property and answer all your real estate questions with personalized recommendations. I can help you with:
                      🏡 Find your dream property
                      📊 Provide accurate property details
                      💰 Share pricing and market trends
                      And much more...
                      What would you like to know?`,
            role: 'assistant',
          },
        ]);

        saveMessageToHistory({
          id: msgId,
          content: ``,
          role: 'user'
        },
        {
          id: msgId,
          content: `Hi, I'm HouseGPT! I can help you find the perfect property and answer all your real estate questions with personalized recommendations. I can help you with:
                      🏡 Find your dream property
                      📊 Provide accurate property details
                      💰 Share pricing and market trends
                      And much more...
                      What would you like to know?`,
          role: 'assistant'
        });
      }
    }
  }, [initialQuery, chatService, chatId, onNewChat, isLoadingHistory, messages.length, shouldSendInitialQuery]);

  // useEffect(() => {

  //   if (isLoadingHistory) {
  //     return;
  //   }

  //   const processInitialQuery = async () => {
  //     if (initialQuery && !initialQueryProcessed.current && chatService && !isLoadingHistory) {
  //       // Mark as processed immediately to prevent duplicate processing
  //       initialQueryProcessed.current = true;
  //       console.log("Processing initial query:", initialQuery);

  //       if (initialQuery !== "##**HouseGPT**#" && shouldSendInitialQuery !== false) {
  //         // Check if this message already exists in the history
  //         const isDuplicateMessage = messages.some(
  //           (msg) => msg.role === 'user' && msg.content === initialQuery
  //         );

  //         console.log("Is duplicate message:", isDuplicateMessage);

  //         // Only send if not a duplicate
  //         if (!isDuplicateMessage) {
  //           console.log("Will send initial query:", initialQuery);

  //           if (chatId) {
  //             // Wait a small delay to ensure everything is loaded
  //             setTimeout(() => {
  //               handleSendMessage(initialQuery);
  //             }, 30);
  //           } else if (onNewChat) {
  //             onNewChat(initialQuery);
  //           }
  //         }
  //       } else if (initialQuery === "##**HouseGPT**#" && messages.length === 0) {
  //         // Only show welcome message if no messages are loaded yet
  //         setMessages([
  //           {
  //             id: generateMessageId(),
  //             content: `Hi, I'm HouseGPT! I can help you find the perfect property and answer all your real estate questions with personalized recommendations. I can help you with:
  //                       🏡 Find your dream property
  //                       📊 Provide accurate property details
  //                       💰 Share pricing and market trends
  //                       And much more...
  //                       What would you like to know?`,
  //             role: 'assistant',
  //           },
  //         ]);
  //       }
  //     }
  //   };

  //   processInitialQuery();
  // }, [initialQuery, chatService, chatId, onNewChat, isLoadingHistory, messages, messages.length, shouldSendInitialQuery]);

  // Modified useEffect for initialQuery handling
  // useEffect(() => {
  //   // Only proceed if not loading history and chatService is available
  //   if (initialQuery && chatService && !isLoadingHistory) {
  //     // Check if this query has already been processed by examining existing messages
  //     const isQueryAlreadyProcessed = messages.some(
  //       msg => msg.role === 'user' && msg.content === initialQuery
  //     );

  //     // Only process if not already in messages and not processed before
  //     if (!isQueryAlreadyProcessed && !initialQueryProcessed.current) {
  //       initialQueryProcessed.current = true;

  //       if (initialQuery !== "##**HouseGPT**#" && shouldSendInitialQuery) {
  //         if (chatId) {
  //           handleSendMessage(initialQuery);
  //         } else if (onNewChat) {
  //           onNewChat(initialQuery);
  //         }
  //       } else if (initialQuery === "##**HouseGPT**#" && messages.length === 0) {
  //         setMessages([
  //           {
  //             id: generateMessageId(),
  //             content: `Hi, I'm HouseGPT! I can help you find the perfect property and answer all your real estate questions with personalized recommendations. I can help you with:
  //                       🏡 Find your dream property
  //                       📊 Provide accurate property details
  //                       💰 Share pricing and market trends
  //                       And much more...
  //                       What would you like to know?`,
  //             role: 'assistant',
  //           },
  //         ]);
  //       }
  //     }
  //   }
  // }, [initialQuery, chatService, chatId, onNewChat, isLoadingHistory, messages, shouldSendInitialQuery]);

  const checkAndUpdateTokens = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    let availableTokens = tokens;

    if (session?.user) {
      const userTokens = await TokenService.fetchUserTokens(session.user.id);
      availableTokens = userTokens.available_tokens;
    }

    if (availableTokens <= 0) {
      toast.error('You have run out of tokens. Please wait for your daily limit to reset or upgrade your plan.');
      return false;
    }

    return true;
  };

  const handleSendMessage = async (content: string) => {
    if (!chatService) {
      toast.error('Chat service not available');
      return;
    }

    const canProceed = await checkAndUpdateTokens();
    if (!canProceed) return;

    // If no chatId is provided and onNewChat callback exists, create a new chat
    if (!chatId && onNewChat) {
      onNewChat(content);
      return;
    }

    setIsLoading(true);
    const userMessage: Message = {
      id: generateMessageId(),
      content,
      role: 'user',
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentStreamingMessage('');

    try {
      const messageId = generateMessageId();
      setMessages(prev => [...prev, { id: messageId, content: '', role: 'assistant' }]);

      // Create a variable to accumulate the message content as it streams
      let fullAssistantMessage = '';

      const { properties, inputLength, outputLength, suggestedQuestions } = await chatService.processMessage(
        content,
        (token) => {
          // Accumulate the tokens as they come in
          fullAssistantMessage += token;

          setCurrentStreamingMessage(prev => prev + token);
          setMessages(prev => prev.map(msg =>
            msg.id === messageId
              ? { ...msg, content: prev.find(m => m.id === messageId)?.content + token || token }
              : msg
          ));
        }
      );

      setSuggestedQuestions(suggestedQuestions || []);

      const tokensUsed = inputLength + outputLength;
      subtractTokens(tokensUsed);

      // Update messages state with properties
      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? { ...msg, properties }
          : msg
      ));

      // If we have a chatId, save this message to the chat history
      if (chatId) {
        saveMessageToHistory(userMessage, {
          id: messageId,
          content: fullAssistantMessage,
          role: 'assistant',
          properties
        });
      }
    } catch (error) {
      const errorMessage = error instanceof ChatServiceError
        ? `Error: ${error.message}`
        : 'An unexpected error occurred';
      toast.error(errorMessage);
      console.error('Error processing message:', error);
    } finally {
      setIsLoading(false);
      setCurrentStreamingMessage('');
    }
  };

  const saveMessageToHistory = async (userMessage: Message, assistantMessage: Message) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // For authenticated users, save to Supabase
        await supabase
          .from('chat_messages')
          .insert([
            {
              chat_id: chatId,
              content: userMessage.content,
              role: 'user',
              message_id: userMessage.id
            },
            {
              chat_id: chatId,
              content: assistantMessage.content,
              role: 'assistant',
              message_id: assistantMessage.id,
              properties: assistantMessage.properties
            }
          ]);
      } else {
        // For non-authenticated users, save to local storage
        const localMessages = JSON.parse(localStorage.getItem(`chat_${chatId}_messages`) || '[]');
        localMessages.push(userMessage, assistantMessage);
        localStorage.setItem(`chat_${chatId}_messages`, JSON.stringify(localMessages));
      }
    } catch (error) {
      console.error('Error saving messages to history:', error);
    }
  };

  return (
    <div className="flex flex-col h-full relative bg-gray-50">
      {isLoadingHistory && (
        <div className="text-center py-4">
          <p className="text-gray-500">Loading conversation history...</p>
        </div>
      )}

      <MessageList
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        suggestedQuestions={suggestedQuestions}
      />

      <div className="sticky bottom-1 bg-white mx-1 border rounded-lg shadow-md">
        <div className="max-w-4xl mx-auto w-full">
          <ChatInput onSend={handleSendMessage} disabled={isLoading || isLoadingHistory} />
        </div>
      </div>
    </div>
  );
}