import { supabase } from './supabaseClient';
import type { Category, Event, Booking, Offer, Complaint, OrganizerRequest, Feedback, User } from '@/types';
import {
  seedCategories, seedEvents, seedBookings, seedOffers, seedComplaints,
  seedOrganizerRequests, seedFeedback, seedUsers,
} from '@/data/seed';

export interface LoadedAppData {
  categories: Category[];
  users: User[];
  events: Event[];
  bookings: Booking[];
  offers: Offer[];
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
        offRes,
        cmpRes,
        orgRes,
        fbRes,
      ] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('users').select('*'),
        supabase.from('events').select('*'),
        supabase.from('bookings').select('*'),
        supabase.from('offers').select('*'),
        supabase.from('complaints').select('*'),
        supabase.from('organizer_requests').select('*'),
        supabase.from('feedback').select('*'),
      ]);

      let categoriesData = catRes.data && catRes.data.length > 0 ? (catRes.data as Category[]) : null;
      let usersData = userRes.data && userRes.data.length > 0 ? (userRes.data as User[]) : null;
      let eventsData = evtRes.data && evtRes.data.length > 0 ? (evtRes.data as Event[]) : null;
      let bookingsData = bkgRes.data && bkgRes.data.length > 0 ? (bkgRes.data as Booking[]) : null;
      let offersData = offRes.data && offRes.data.length > 0 ? (offRes.data as Offer[]) : null;
      let complaintsData = cmpRes.data && cmpRes.data.length > 0 ? (cmpRes.data as Complaint[]) : null;
      let orgRequestsData = orgRes.data && orgRes.data.length > 0 ? (orgRes.data as OrganizerRequest[]) : null;
      let feedbackData = fbRes.data && fbRes.data.length > 0 ? (fbRes.data as Feedback[]) : null;

      // Seed if empty
      if (!usersData) {
        await supabase.from('users').insert(seedUsers);
        usersData = seedUsers;
      }

      if (!categoriesData) {
        await supabase.from('categories').insert(seedCategories);
        categoriesData = seedCategories;
      }

      if (!eventsData) {
        await supabase.from('events').insert(seedEvents);
        eventsData = seedEvents;
      }

      if (!bookingsData) {
        await supabase.from('bookings').insert(seedBookings);
        bookingsData = seedBookings;
      }

      if (!offersData) {
        await supabase.from('offers').insert(seedOffers);
        offersData = seedOffers;
      }

      if (!complaintsData) {
        await supabase.from('complaints').insert(seedComplaints);
        complaintsData = seedComplaints;
      }

      if (!orgRequestsData) {
        await supabase.from('organizer_requests').insert(seedOrganizerRequests);
        orgRequestsData = seedOrganizerRequests;
      }

      if (!feedbackData) {
        await supabase.from('feedback').insert(seedFeedback);
        feedbackData = seedFeedback;
      }

      return {
        categories: categoriesData,
        users: usersData,
        events: eventsData,
        bookings: bookingsData,
        offers: offersData,
        complaints: complaintsData,
        organizerRequests: orgRequestsData,
        feedback: feedbackData,
      };
    } catch (err) {
      console.error('Error loading data from Supabase, falling back to local seed:', err);
      return {
        categories: seedCategories,
        users: seedUsers,
        events: seedEvents,
        bookings: seedBookings,
        offers: seedOffers,
        complaints: seedComplaints,
        organizerRequests: seedOrganizerRequests,
        feedback: seedFeedback,
      };
    }
  },
};
