import { supabase } from './supabaseClient';
import type { Event } from '@/types';

export const eventsService = {
  async fetchEvents(): Promise<Event[]> {
    const { data, error } = await supabase.from('events').select('*');
    if (error) {
      console.error('Error fetching events from Supabase:', error);
      return [];
    }
    return (data as Event[]) || [];
  },

  async createEvent(event: Event): Promise<boolean> {
    const { error } = await supabase.from('events').insert(event);
    if (error) {
      console.error('Error inserting event into Supabase:', error);
      return false;
    }
    return true;
  },

  async updateEvent(id: string, patch: Partial<Event>): Promise<boolean> {
    const { error } = await supabase.from('events').update(patch).eq('id', id);
    if (error) {
      console.error('Error updating event in Supabase:', error);
      return false;
    }
    return true;
  },

  async deleteEvent(id: string): Promise<boolean> {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      console.error('Error deleting event from Supabase:', error);
      return false;
    }
    return true;
  },
};
