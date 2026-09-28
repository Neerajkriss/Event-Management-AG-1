import { supabase } from './supabaseClient';
import type { Booking } from '@/types';

export const bookingsService = {
  async fetchBookings(): Promise<Booking[]> {
    const { data, error } = await supabase.from('bookings').select('*');
    if (error) {
      console.error('Error fetching bookings from Supabase:', error);
      return [];
    }
    return (data as Booking[]) || [];
  },

  async createBooking(booking: Booking): Promise<boolean> {
    const { error } = await supabase.from('bookings').insert(booking);
    if (error) {
      console.error('Error inserting booking into Supabase:', error);
      return false;
    }
    return true;
  },

  async updateBooking(id: string, patch: Partial<Booking>): Promise<boolean> {
    const { error } = await supabase.from('bookings').update(patch).eq('id', id);
    if (error) {
      console.error('Error updating booking in Supabase:', error);
      return false;
    }
    return true;
  },

  async deleteBooking(id: string): Promise<boolean> {
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) {
      console.error('Error deleting booking from Supabase:', error);
      return false;
    }
    return true;
  },
};
