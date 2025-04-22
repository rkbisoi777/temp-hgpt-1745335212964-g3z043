import { supabase } from './supabaseClient';

export interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  category?: string;
  tags?: string[];
  meta_description?: string;
  meta_keywords?: string[];
  published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export const blogService = {
  async getAllPublishedPosts(): Promise<BlogPostItem[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPostBySlug(slug: string): Promise<BlogPostItem | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  },

  async getPostsByCategory(category: string): Promise<BlogPostItem[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('category', category)
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPostsByTag(tag: string): Promise<BlogPostItem[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .contains('tags', [tag])
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createPost(post: Partial<BlogPostItem>): Promise<BlogPostItem> {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([post])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePost(id: string, updates: Partial<BlogPostItem>): Promise<BlogPostItem> {
    const { data, error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePost(id: string): Promise<void> {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};