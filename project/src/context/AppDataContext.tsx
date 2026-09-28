import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Category, Event, Booking, Offer, Complaint, OrganizerRequest, Feedback, User } from '@/types';
import {
  seedCategories, seedEvents, seedBookings, seedOffers, seedComplaints,
  seedOrganizerRequests, seedFeedback, seedUsers,
} from '@/data/seed';
import {
  categoriesService, eventsService, bookingsService,
  offersService, supportService, seedService,
} from '@/services';

export interface AppState {
  categories: Category[];
  events: Event[];
  bookings: Booking[];
  offers: Offer[];
  complaints: Complaint[];
  organizerRequests: OrganizerRequest[];
  feedback: Feedback[];
  users: User[];
}

export interface AppDataContextValue extends AppState {
  // Categories
  addCategory: (cat: Omit<Category, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  // Events
  addEvent: (evt: Omit<Event, 'id' | 'createdAt'>) => void;
  updateEvent: (id: string, patch: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  // Bookings
  addBooking: (bkg: Omit<Booking, 'id' | 'createdAt'>) => void;
  updateBooking: (id: string, patch: Partial<Booking>) => void;
  deleteBooking: (id: string) => void;
  // Offers
  addOffer: (off: Omit<Offer, 'id' | 'createdAt'>) => void;
  updateOffer: (id: string, patch: Partial<Offer>) => void;
  deleteOffer: (id: string) => void;
  // Complaints
  addComplaint: (cmp: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateComplaint: (id: string, patch: Partial<Complaint>) => void;
  deleteComplaint: (id: string) => void;
  // Organizer Requests
  addOrganizerRequest: (req: Omit<OrganizerRequest, 'id' | 'submittedAt'>) => void;
  updateOrganizerRequest: (id: string, patch: Partial<OrganizerRequest>) => void;
  deleteOrganizerRequest: (id: string) => void;
  // Feedback
  addFeedback: (fb: Omit<Feedback, 'id' | 'createdAt'>) => void;
  updateFeedback: (id: string, patch: Partial<Feedback>) => void;
  deleteFeedback: (id: string) => void;
  // Users
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, patch: Partial<User>) => void;
  deleteUser: (id: string) => void;
  // Utility
  resetData: () => void;
}

const initialState: AppState = {
  categories: seedCategories,
  events: seedEvents,
  bookings: seedBookings,
  offers: seedOffers,
  complaints: seedComplaints,
  organizerRequests: seedOrganizerRequests,
  feedback: seedFeedback,
  users: seedUsers,
};

export const AppDataContext = createContext<AppDataContextValue | null>(null);

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const data = await seedService.loadAndSeedAll();
      if (isMounted) {
        setState(data);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Categories
  const addCategory = useCallback((cat: Omit<Category, 'id' | 'createdAt'>) => {
    const newCat: Category = { ...cat, id: genId('cat'), createdAt: new Date().toISOString() };
    setState((prev) => ({ ...prev, categories: [...prev.categories, newCat] }));
    categoriesService.createCategory(newCat);
  }, []);

  const updateCategory = useCallback((id: string, patch: Partial<Category>) => {
    setState((prev) => ({ ...prev, categories: prev.categories.map((c) => c.id === id ? { ...c, ...patch } : c) }));
    categoriesService.updateCategory(id, patch);
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setState((prev) => ({ ...prev, categories: prev.categories.filter((c) => c.id !== id) }));
    categoriesService.deleteCategory(id);
  }, []);

  // Events
  const addEvent = useCallback((evt: Omit<Event, 'id' | 'createdAt'>) => {
    const newEvt: Event = { ...evt, id: genId('evt'), createdAt: new Date().toISOString() };
    setState((prev) => ({ ...prev, events: [...prev.events, newEvt] }));
    eventsService.createEvent(newEvt);
  }, []);

  const updateEvent = useCallback((id: string, patch: Partial<Event>) => {
    setState((prev) => ({ ...prev, events: prev.events.map((e) => e.id === id ? { ...e, ...patch } : e) }));
    eventsService.updateEvent(id, patch);
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setState((prev) => ({ ...prev, events: prev.events.filter((e) => e.id !== id) }));
    eventsService.deleteEvent(id);
  }, []);

  // Bookings
  const addBooking = useCallback((bkg: Omit<Booking, 'id' | 'createdAt'>) => {
    const newBkg: Booking = { ...bkg, id: genId('bkg'), createdAt: new Date().toISOString() };
    setState((prev) => ({
      ...prev,
      bookings: [...prev.bookings, newBkg],
      events: prev.events.map((e) =>
        e.id === bkg.eventId ? { ...e, bookedCount: e.bookedCount + bkg.tickets } : e
      ),
    }));
    bookingsService.createBooking(newBkg);
    // sync bookedCount to Supabase
    const targetEvt = state.events.find((e) => e.id === bkg.eventId);
    if (targetEvt) {
      eventsService.updateEvent(targetEvt.id, { bookedCount: targetEvt.bookedCount + bkg.tickets });
    }
  }, [state.events]);

  const updateBooking = useCallback((id: string, patch: Partial<Booking>) => {
    setState((prev) => ({ ...prev, bookings: prev.bookings.map((b) => b.id === id ? { ...b, ...patch } : b) }));
    bookingsService.updateBooking(id, patch);
  }, []);

  const deleteBooking = useCallback((id: string) => {
    setState((prev) => ({ ...prev, bookings: prev.bookings.filter((b) => b.id !== id) }));
    bookingsService.deleteBooking(id);
  }, []);

  // Offers
  const addOffer = useCallback((off: Omit<Offer, 'id' | 'createdAt'>) => {
    const newOff: Offer = { ...off, id: genId('off'), createdAt: new Date().toISOString() };
    setState((prev) => ({ ...prev, offers: [...prev.offers, newOff] }));
    offersService.createOffer(newOff);
  }, []);

  const updateOffer = useCallback((id: string, patch: Partial<Offer>) => {
    setState((prev) => ({ ...prev, offers: prev.offers.map((o) => o.id === id ? { ...o, ...patch } : o) }));
    offersService.updateOffer(id, patch);
  }, []);

  const deleteOffer = useCallback((id: string) => {
    setState((prev) => ({ ...prev, offers: prev.offers.filter((o) => o.id !== id) }));
    offersService.deleteOffer(id);
  }, []);

  // Complaints
  const addComplaint = useCallback((cmp: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newCmp: Complaint = { ...cmp, id: genId('cmp'), createdAt: now, updatedAt: now };
    setState((prev) => ({ ...prev, complaints: [...prev.complaints, newCmp] }));
    supportService.createComplaint(newCmp);
  }, []);

  const updateComplaint = useCallback((id: string, patch: Partial<Complaint>) => {
    const updated = { ...patch, updatedAt: new Date().toISOString() };
    setState((prev) => ({ ...prev, complaints: prev.complaints.map((c) => c.id === id ? { ...c, ...updated } : c) }));
    supportService.updateComplaint(id, updated);
  }, []);

  const deleteComplaint = useCallback((id: string) => {
    setState((prev) => ({ ...prev, complaints: prev.complaints.filter((c) => c.id !== id) }));
    supportService.deleteComplaint(id);
  }, []);

  // Organizer Requests
  const addOrganizerRequest = useCallback((req: Omit<OrganizerRequest, 'id' | 'submittedAt'>) => {
    const newReq: OrganizerRequest = { ...req, id: genId('org-req'), submittedAt: new Date().toISOString() };
    setState((prev) => ({ ...prev, organizerRequests: [...prev.organizerRequests, newReq] }));
    supportService.createOrganizerRequest(newReq);
  }, []);

  const updateOrganizerRequest = useCallback((id: string, patch: Partial<OrganizerRequest>) => {
    setState((prev) => ({ ...prev, organizerRequests: prev.organizerRequests.map((r) => r.id === id ? { ...r, ...patch } : r) }));
    supportService.updateOrganizerRequest(id, patch);
  }, []);

  const deleteOrganizerRequest = useCallback((id: string) => {
    setState((prev) => ({ ...prev, organizerRequests: prev.organizerRequests.filter((r) => r.id !== id) }));
    supportService.deleteOrganizerRequest(id);
  }, []);

  // Feedback
  const addFeedback = useCallback((fb: Omit<Feedback, 'id' | 'createdAt'>) => {
    const newFb: Feedback = { ...fb, id: genId('fb'), createdAt: new Date().toISOString() };
    setState((prev) => ({ ...prev, feedback: [...prev.feedback, newFb] }));
    supportService.createFeedback(newFb);
  }, []);

  const updateFeedback = useCallback((id: string, patch: Partial<Feedback>) => {
    setState((prev) => ({ ...prev, feedback: prev.feedback.map((f) => f.id === id ? { ...f, ...patch } : f) }));
    supportService.updateFeedback(id, patch);
  }, []);

  const deleteFeedback = useCallback((id: string) => {
    setState((prev) => ({ ...prev, feedback: prev.feedback.filter((f) => f.id !== id) }));
    supportService.deleteFeedback(id);
  }, []);

  // Users
  const addUser = useCallback((user: Omit<User, 'id'>) => {
    const newUser: User = { ...user, id: genId('u') };
    setState((prev) => ({ ...prev, users: [...prev.users, newUser] }));
  }, []);

  const updateUser = useCallback((id: string, patch: Partial<User>) => {
    setState((prev) => ({ ...prev, users: prev.users.map((u) => u.id === id ? { ...u, ...patch } : u) }));
  }, []);

  const deleteUser = useCallback((id: string) => {
    setState((prev) => ({ ...prev, users: prev.users.filter((u) => u.id !== id) }));
  }, []);

  const resetData = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        ...state,
        addCategory,
        updateCategory,
        deleteCategory,
        addEvent,
        updateEvent,
        deleteEvent,
        addBooking,
        updateBooking,
        deleteBooking,
        addOffer,
        updateOffer,
        deleteOffer,
        addComplaint,
        updateComplaint,
        deleteComplaint,
        addOrganizerRequest,
        updateOrganizerRequest,
        deleteOrganizerRequest,
        addFeedback,
        updateFeedback,
        deleteFeedback,
        addUser,
        updateUser,
        deleteUser,
        resetData,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}
