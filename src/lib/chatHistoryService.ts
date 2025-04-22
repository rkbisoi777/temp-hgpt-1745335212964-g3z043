import { supabase } from './supabaseClient';

export interface ChatHistory {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export const ChatHistoryService = {
  async createChat(userId: string, title: string) {
    const { data, error } = await supabase
      .from('chat_history')
      .insert([{ user_id: userId, title }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getChatHistory(userId: string) {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getChatMessages(chatId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async addMessage(chatId: string, content: string, role: 'user' | 'assistant') {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{ chat_id: chatId, content, role }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteChat(chatId: string) {
    const { error } = await supabase
      .from('chat_history')
      .delete()
      .eq('id', chatId);

    if (error) throw error;
    return true;
  },

  async updateChatTitle(chatId: string, title: string) {
    const { error } = await supabase
      .from('chat_history')
      .update({ title })
      .eq('id', chatId);

    if (error) throw error;
    return true;
  }
};