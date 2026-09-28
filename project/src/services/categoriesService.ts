import { supabase } from './supabaseClient';
import type { Category } from '@/types';

export const categoriesService = {
  async fetchCategories(): Promise<Category[]> {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
      console.error('Error fetching categories from Supabase:', error);
      return [];
    }
    return (data as Category[]) || [];
  },

  async createCategory(category: Category): Promise<boolean> {
    const { error } = await supabase.from('categories').insert(category);
    if (error) {
      console.error('Error inserting category into Supabase:', error);
      return false;
    }
    return true;
  },

  async updateCategory(id: string, patch: Partial<Category>): Promise<boolean> {
    const { error } = await supabase.from('categories').update(patch).eq('id', id);
    if (error) {
      console.error('Error updating category in Supabase:', error);
      return false;
    }
    return true;
  },

  async deleteCategory(id: string): Promise<boolean> {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      console.error('Error deleting category from Supabase:', error);
      return false;
    }
    return true;
  },
};
