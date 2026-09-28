import { supabase } from './supabaseClient';
import type { Offer } from '@/types';

export const offersService = {
  async fetchOffers(): Promise<Offer[]> {
    const { data, error } = await supabase.from('offers').select('*');
    if (error) {
      console.error('Error fetching offers from Supabase:', error);
      return [];
    }
    return (data as Offer[]) || [];
  },

  async createOffer(offer: Offer): Promise<boolean> {
    const { error } = await supabase.from('offers').insert(offer);
    if (error) {
      console.error('Error inserting offer into Supabase:', error);
      return false;
    }
    return true;
  },

  async updateOffer(id: string, patch: Partial<Offer>): Promise<boolean> {
    const { error } = await supabase.from('offers').update(patch).eq('id', id);
    if (error) {
      console.error('Error updating offer in Supabase:', error);
      return false;
    }
    return true;
  },

  async deleteOffer(id: string): Promise<boolean> {
    const { error } = await supabase.from('offers').delete().eq('id', id);
    if (error) {
      console.error('Error deleting offer from Supabase:', error);
      return false;
    }
    return true;
  },
};
