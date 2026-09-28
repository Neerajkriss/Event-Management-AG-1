import { supabase } from './supabaseClient';
import type { Complaint, Feedback, OrganizerRequest } from '@/types';

export const supportService = {
  // Complaints
  async fetchComplaints(): Promise<Complaint[]> {
    const { data, error } = await supabase.from('complaints').select('*');
    if (error) {
      console.error('Error fetching complaints from Supabase:', error);
      return [];
    }
    return (data as Complaint[]) || [];
  },

  async createComplaint(complaint: Complaint): Promise<boolean> {
    const { error } = await supabase.from('complaints').insert(complaint);
    if (error) {
      console.error('Error inserting complaint into Supabase:', error);
      return false;
    }
    return true;
  },

  async updateComplaint(id: string, patch: Partial<Complaint>): Promise<boolean> {
    const { error } = await supabase.from('complaints').update(patch).eq('id', id);
    if (error) {
      console.error('Error updating complaint in Supabase:', error);
      return false;
    }
    return true;
  },

  async deleteComplaint(id: string): Promise<boolean> {
    const { error } = await supabase.from('complaints').delete().eq('id', id);
    if (error) {
      console.error('Error deleting complaint from Supabase:', error);
      return false;
    }
    return true;
  },

  // Organizer Requests
  async fetchOrganizerRequests(): Promise<OrganizerRequest[]> {
    const { data, error } = await supabase.from('organizer_requests').select('*');
    if (error) {
      console.error('Error fetching organizer requests from Supabase:', error);
      return [];
    }
    return (data as OrganizerRequest[]) || [];
  },

  async createOrganizerRequest(request: OrganizerRequest): Promise<boolean> {
    const { error } = await supabase.from('organizer_requests').insert(request);
    if (error) {
      console.error('Error inserting organizer request into Supabase:', error);
      return false;
    }
    return true;
  },

  async updateOrganizerRequest(id: string, patch: Partial<OrganizerRequest>): Promise<boolean> {
    const { error } = await supabase.from('organizer_requests').update(patch).eq('id', id);
    if (error) {
      console.error('Error updating organizer request in Supabase:', error);
      return false;
    }
    return true;
  },

  async deleteOrganizerRequest(id: string): Promise<boolean> {
    const { error } = await supabase.from('organizer_requests').delete().eq('id', id);
    if (error) {
      console.error('Error deleting organizer request from Supabase:', error);
      return false;
    }
    return true;
  },

  // Feedback
  async fetchFeedback(): Promise<Feedback[]> {
    const { data, error } = await supabase.from('feedback').select('*');
    if (error) {
      console.error('Error fetching feedback from Supabase:', error);
      return [];
    }
    return (data as Feedback[]) || [];
  },

  async createFeedback(fb: Feedback): Promise<boolean> {
    const { error } = await supabase.from('feedback').insert(fb);
    if (error) {
      console.error('Error inserting feedback into Supabase:', error);
      return false;
    }
    return true;
  },

  async updateFeedback(id: string, patch: Partial<Feedback>): Promise<boolean> {
    const { error } = await supabase.from('feedback').update(patch).eq('id', id);
    if (error) {
      console.error('Error updating feedback in Supabase:', error);
      return false;
    }
    return true;
  },

  async deleteFeedback(id: string): Promise<boolean> {
    const { error } = await supabase.from('feedback').delete().eq('id', id);
    if (error) {
      console.error('Error deleting feedback from Supabase:', error);
      return false;
    }
    return true;
  },
};
