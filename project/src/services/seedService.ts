import { supabase } from './supabaseClient';
import type { Category, Event, Booking, Complaint, OrganizerRequest, Feedback, User } from '@/types';
import {
  seedCategories, seedEvents, seedBookings, seedComplaints,
  seedOrganizerRequests, seedFeedback, seedUsers,
} from '@/data/seed';
import { authService } from './authService';

export interface LoadedAppData {
  categories: Category[];
  users: User[];
  events: Event[];
  bookings: Booking[];
  complaints: Complaint[];
  organizerRequests: OrganizerRequest[];
  feedback: Feedback[];
}

export const seedService = {
  async loadAndSeedAll(): Promise<LoadedAppData> {
    try {
      const [
        catRes,
        userRes,
        evtRes,
        bkgRes,
        cmpRes,
        orgRes,
        fbRes,
      ] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('users').select('*'),
        supabase.from('events').select('*'),
        supabase.from('bookings').select('*'),
        supabase.from('complaints').select('*'),
        supabase.from('organizer_requests').select('*'),
        supabase.from('feedback').select('*'),
      ]);

      let categoriesData = catRes.data && catRes.data.length > 0 ? (catRes.data as Category[]) : null;
      let usersData = userRes.data && userRes.data.length > 0 ? (userRes.data as User[]) : null;
      let eventsData = evtRes.data && evtRes.data.length > 0 ? (evtRes.data as Event[]) : null;
      let bookingsData = bkgRes.data && bkgRes.data.length > 0 ? (bkgRes.data as Booking[]) : null;
      let complaintsData = cmpRes.data && cmpRes.data.length > 0 ? (cmpRes.data as Complaint[]) : null;
      let orgRequestsData = orgRes.data && orgRes.data.length > 0 ? (orgRes.data as OrganizerRequest[]) : null;
      let feedbackData = fbRes.data && fbRes.data.length > 0 ? (fbRes.data as Feedback[]) : null;

      // Seed if empty
      if (!usersData) {
        try {
          await supabase.from('users').insert(seedUsers);
        } catch {
          // ignore seeding error
        }
        usersData = seedUsers;
      }

      // Merge local registered users so they always persist in UI
      const localUsers = authService.getLocalUsers();
      const userMap = new Map<string, User>();
      for (const u of seedUsers) userMap.set(u.email.toLowerCase(), u);
      for (const u of localUsers) userMap.set(u.email.toLowerCase(), u);
      for (const u of usersData) userMap.set(u.email.toLowerCase(), u);
      usersData = Array.from(userMap.values());

      if (!categoriesData) {
        try {
          await supabase.from('categories').insert(seedCategories);
        } catch {
          // ignore
        }
        categoriesData = seedCategories;
      }

      if (!eventsData) {
        try {
          await supabase.from('events').insert(seedEvents);
        } catch {
          // ignore
        }
        eventsData = seedEvents;
      }

      if (!bookingsData) {
        try {
          await supabase.from('bookings').insert(seedBookings);
        } catch {
          // ignore
        }
        bookingsData = seedBookings;
      }

      if (!complaintsData) {
        try {
          await supabase.from('complaints').insert(seedComplaints);
        } catch {
          // ignore
        }
        complaintsData = seedComplaints;
      }

      if (!orgRequestsData) {
        try {
          await supabase.from('organizer_requests').insert(seedOrganizerRequests);
        } catch {
          // ignore
        }
        orgRequestsData = seedOrganizerRequests;
      }

      if (!feedbackData) {
        try {
          await supabase.from('feedback').insert(seedFeedback);
        } catch {
          // ignore
        }
        feedbackData = seedFeedback;
      }

      return {
        categories: categoriesData,
        users: usersData,
        events: eventsData,
        bookings: bookingsData,
        complaints: complaintsData,
        organizerRequests: orgRequestsData,
        feedback: feedbackData,
      };
    } catch (err) {
      console.error('Error loading data from Supabase, falling back to local seed:', err);
      const localUsers = authService.getLocalUsers();
      const userMap = new Map<string, User>();
      for (const u of seedUsers) userMap.set(u.email.toLowerCase(), u);
      for (const u of localUsers) userMap.set(u.email.toLowerCase(), u);
      return {
        categories: seedCategories,
        users: Array.from(userMap.values()),
        events: seedEvents,
        bookings: seedBookings,
        complaints: seedComplaints,
        organizerRequests: seedOrganizerRequests,
        feedback: seedFeedback,
      };
    }
  },
};

