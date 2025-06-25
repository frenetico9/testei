
// This is a MOCK Supabase service. In a real app, you'd use @supabase/supabase-js.
import { 
    User, SupabaseAuthUser, SupabaseResponse, 
    Barbershop, Service, Barber, Booking, Review, Plan, PlanTier, UserRole, BookingStatus 
} from '../types';
import { MOCK_BARBERSHOP_ID, MOCK_SERVICES_DATA, MOCK_BARBERS_DATA, MOCK_BOOKINGS_DATA, MOCK_CLIENTS_DATA, MOCK_REVIEWS_DATA, PLANS } from '../constants';

// Simulate a Supabase client
const mockSupabaseClient = {
  auth: {
    signUp: async ({ email, password, options }: any): Promise<SupabaseResponse<{ user: SupabaseAuthUser | null; session: any | null }>> => {
      console.log('Mock Supabase signUp:', { email, password, options });
      await new Promise(resolve => setTimeout(resolve, 500));
      if (email === 'exists@example.com') {
        return { data: { user: null, session: null }, error: new Error('User already registered') };
      }
      const newUser: SupabaseAuthUser = { id: `user_${Date.now()}`, email };
      // Simulate creating a user profile entry
      const userProfile: User = { 
        id: newUser.id, 
        email, 
        name: options?.data?.name || 'New User', 
        phone: options?.data?.phone || '', 
        role: options?.data?.role || UserRole.CLIENT, // Use provided role or default to client
        currentPlan: options?.data?.role === UserRole.ADMIN ? PlanTier.FREE : undefined, // Default plan for new admins
        barbershopId: (options?.data?.role === UserRole.ADMIN) ? `bs_${Date.now()}` : undefined
      };
      mockDatabase.users.push(userProfile);
      if(userProfile.role === UserRole.ADMIN && userProfile.barbershopId) {
        mockDatabase.barbershops.push({
          id: userProfile.barbershopId,
          name: `${userProfile.name}'s Barbershop`, // Use the name from options for barbershop
          ownerId: userProfile.id,
          address: 'Not set',
        });
      }
      return { data: { user: newUser, session: { access_token: 'mock_token', user: newUser } }, error: null };
    },
    signInWithPassword: async ({ email, password }: any): Promise<SupabaseResponse<{ user: SupabaseAuthUser | null; session: any | null }>> => {
      console.log('Mock Supabase signInWithPassword:', { email, password });
      await new Promise(resolve => setTimeout(resolve, 500));
      const foundUser = mockDatabase.users.find(u => u.email === email); // Simplified: no password check
      if (foundUser) {
        const authUser: SupabaseAuthUser = { id: foundUser.id, email: foundUser.email };
        return { data: { user: authUser, session: { access_token: 'mock_token', user: authUser } }, error: null };
      }
      return { data: { user: null, session: null }, error: new Error('Invalid login credentials') };
    },
    signOut: async (): Promise<SupabaseResponse<null>> => {
      console.log('Mock Supabase signOut');
      await new Promise(resolve => setTimeout(resolve, 200));
      return { data: null, error: null };
    },
    getSession: async (): Promise<SupabaseResponse<{ session: any | null }>> => {
      console.log('Mock Supabase getSession');
      // Simulate a logged-in user for easier development of protected routes
      // To test login flow, comment this out or make it return null initially
      const mockUserId = mockAdminUser.id; // Or mockClientUser.id
      const user = mockDatabase.users.find(u => u.id === mockUserId);
      if (user) {
         const authUser: SupabaseAuthUser = { id: user.id, email: user.email };
         return { data: { session: { access_token: 'mock_token', user: authUser } }, error: null };
      }
      return { data: { session: null }, error: null };
    },
    updateUser: async (credentials: any): Promise<SupabaseResponse<{ user: SupabaseAuthUser | null}>> => {
        console.log('Mock Supabase updateUser:', credentials);
        await new Promise(resolve => setTimeout(resolve, 500));
        const currentUser = mockDatabase.users[0]; 
        if (currentUser) {
             const authUser: SupabaseAuthUser = { id: currentUser.id, email: currentUser.email };
             return { data: { user: authUser }, error: null };
        }
        return { data: { user: null }, error: new Error('User not found for update') };
    },
     onAuthStateChange: (callback: (event: string, session: any | null) => void): { data: { subscription: any } } => {
      console.log('Mock Supabase onAuthStateChange registered');
      return { data: { subscription: { unsubscribe: () => console.log('Mock unsubscribed from auth changes') } } };
    },
  },
  from: function<T extends {id: string | number},>(tableName: string) {
    let _currentFilter: { column: string, value: any, type?: 'eq' | 'in' } | null = null;

    const self = {
      eq: (column: string, value: any): typeof self => {
        console.log(`Mock Supabase .eq('${column}', '${value}') on ${tableName}`);
        _currentFilter = { column, value, type: 'eq' };
        return self;
      },
      in: (column: string, values: any[]): typeof self => {
        console.log(`Mock Supabase .in('${column}', [${values.join(',')}]) on ${tableName}`);
        _currentFilter = { column, value: values, type: 'in'};
        return self;
      },
      select: async (query?: string): Promise<SupabaseResponse<T[]>> => {
        console.log(`Mock Supabase select from ${tableName} with query: ${query}, filter:`, _currentFilter);
        await new Promise(resolve => setTimeout(resolve, 300));
        let results = (mockDatabase[tableName as keyof typeof mockDatabase] || []) as unknown as T[];
        
        if (_currentFilter) {
          if (_currentFilter.type === 'in') {
            const valuesToMatch = _currentFilter.value as any[];
            results = results.filter(item => valuesToMatch.includes((item as any)[_currentFilter!.column]));
          } else { // Default to 'eq'
            results = results.filter(item => (item as any)[_currentFilter!.column] === _currentFilter!.value);
          }
        } else if (query) { // Fallback to basic query string parsing if no chained filter
            if (query.includes('eq(')) {
                const match = query.match(/eq\('([^']*)','([^']*)'\)/);
                if (match) {
                    const [, column, value] = match;
                    results = results.filter(item => (item as any)[column] === value);
                }
            }
             if (query.includes('in(')) {
                const match = query.match(/in\('([^']*)', \(([^)]*)\)\)/);
                if (match) {
                    const [, column, valuesString] = match;
                    const values = valuesString.split(',').map(v => v.trim().replace(/'/g, ''));
                    results = results.filter(item => values.includes(String((item as any)[column])));
                }
            }
        }
        _currentFilter = null; // Clear filter for next chain
        return { data: results, error: null };
      },
      single: async (): Promise<SupabaseResponse<T | null>> => {
        console.log(`Mock Supabase .single() on ${tableName} with filter:`, _currentFilter);
        // This relies on select() properly using and then clearing _currentFilter.
        // So, we call select and then take the first item.
        // A temporary filter variable is needed if select clears _currentFilter.
        const originalFilter = _currentFilter ? {..._currentFilter} : null;

        let results = (mockDatabase[tableName as keyof typeof mockDatabase] || []) as unknown as T[];
        if (originalFilter) {
             if (originalFilter.type === 'in') {
                const valuesToMatch = originalFilter.value as any[];
                results = results.filter(item => valuesToMatch.includes((item as any)[originalFilter!.column]));
            } else { // Default to 'eq'
                results = results.filter(item => (item as any)[originalFilter!.column] === originalFilter!.value);
            }
        }
        _currentFilter = null; // Clear filter for next chain

        if (results.length > 0) {
          if (results.length > 1) console.warn(`Mock .single() called on ${tableName} but multiple rows matched filter. Returning first.`);
          return { data: results[0], error: null };
        }
        return { data: null, error: null }; // Supabase single() returns null data and null error if no row found.
      },
      insert: async (records: Partial<T> | Partial<T>[]): Promise<SupabaseResponse<T[]>> => {
        console.log(`Mock Supabase insert into ${tableName}:`, records);
        await new Promise(resolve => setTimeout(resolve, 300));
        const table = mockDatabase[tableName as keyof typeof mockDatabase] as unknown as T[];
        const newRecords = (Array.isArray(records) ? records : [records]).map(r => ({ ...r, id: `new_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, createdAt: new Date().toISOString() } as unknown as T));
        table.push(...newRecords);
        return { data: newRecords, error: null };
      },
      update: async (values: Partial<T>): Promise<SupabaseResponse<T[]>> => {
        console.log(`Mock Supabase update ${tableName} with filter:`, _currentFilter, 'values:', values);
        await new Promise(resolve => setTimeout(resolve, 300));
        const table = mockDatabase[tableName as keyof typeof mockDatabase] as unknown as T[];
        let updatedRecords: T[] = [];

        if (!_currentFilter) {
            return { data: [], error: new Error("Mock update requires an .eq() condition.") };
        }
        
        mockDatabase[tableName as keyof typeof mockDatabase] = table.map(item => {
            let match = false;
            // Assuming _currentFilter is set by .eq() before .update()
            if (_currentFilter && (item as any)[_currentFilter.column] === _currentFilter.value) {
                match = true;
            }

            if (match) {
                // Ensure 'id' is not overwritten if it's part of 'values' but shouldn't be
                const { id, ...restOfValues } = values as any;
                const updatedItem = { ...item, ...restOfValues, updatedAt: new Date().toISOString() };
                updatedRecords.push(updatedItem as T);
                return updatedItem;
            }
            return item;
        }) as any;
        _currentFilter = null; // Clear filter
        if (updatedRecords.length === 0) {
             return { data: [], error: new Error('No items matched the filter for update.') };
        }
        return { data: updatedRecords, error: null };
      },
      delete: async (): Promise<SupabaseResponse<T[]>> => { 
        console.log(`Mock Supabase delete from ${tableName} with filter:`, _currentFilter);
        await new Promise(resolve => setTimeout(resolve, 300));
        let deletedItems: T[] = [];

        if (!_currentFilter) {
            return { data: [], error: new Error("Mock delete requires an .eq() condition.") };
        }
        
        mockDatabase[tableName as keyof typeof mockDatabase] = (mockDatabase[tableName as keyof typeof mockDatabase] as unknown as T[]).filter(item => {
            const match = (item as any)[_currentFilter!.column] === _currentFilter!.value;
            if (match) {
                deletedItems.push(item);
            }
            return !match;
        }) as any;
        
        _currentFilter = null; // Clear filter

        if (deletedItems.length === 0) {
             // Supabase delete doesn't error if no rows match, it just returns empty data.
             return { data: [], error: null };
        }
        return { data: deletedItems, error: null };
      },
    };
    return self;
  },
};

// Mock Database Store
const mockAdminUser: User = {
  id: 'admin_user_id', name: 'Admin Barbearia', email: 'admin@example.com', phone: '11999998888', 
  role: UserRole.ADMIN, barbershopId: MOCK_BARBERSHOP_ID, currentPlan: PlanTier.PREMIUM, 
  profilePictureUrl: 'https://picsum.photos/seed/adminuser/100/100'
};
const mockClientUser: User = {
  id: 'client_user_id', name: 'Cliente Teste', email: 'client@example.com', phone: '11977776666', 
  role: UserRole.CLIENT,
  profilePictureUrl: 'https://picsum.photos/seed/clientuser/100/100'
};

const mockDatabase: {
  users: User[];
  barbershops: Barbershop[];
  services: Service[];
  barbers: Barber[];
  bookings: Booking[];
  reviews: Review[];
  plans: Plan[];
} = {
  users: [
    mockAdminUser, 
    mockClientUser, 
    ...MOCK_CLIENTS_DATA, // Add other mock clients
    ...MOCK_BARBERS_DATA.map(b => ({id: b.userId, name: b.name, email: b.email, phone: 'N/A', role: UserRole.BARBER, barbershopId: b.barbershopId, profilePictureUrl: b.profilePictureUrl} as User)) // Add barbers as users
  ],
  barbershops: [{ 
    id: MOCK_BARBERSHOP_ID, 
    name: 'Navalha Digital HQ Barbershop', 
    address: '123 Main St, Anytown', 
    logoUrl: 'https://via.placeholder.com/150/0D1F2D/FFFFFF?text=Logo', 
    ownerId: 'admin_user_id',
    phone: '123-456-7890',
    description: 'A melhor barbearia da cidade, com estilo retrô moderno e os melhores profissionais.',
    photos: ['https://picsum.photos/seed/barbershop1/600/400', 'https://picsum.photos/seed/barbershop2/600/400'],
    operatingHours: [
        { day: 'Monday', open: '09:00', close: '19:00' },
        { day: 'Tuesday', open: '09:00', close: '19:00' },
        { day: 'Wednesday', open: '09:00', close: '19:00' },
        { day: 'Thursday', open: '09:00', close: '19:00' },
        { day: 'Friday', open: '09:00', close: '21:00' },
        { day: 'Saturday', open: '08:00', close: '18:00' },
        { day: 'Sunday', open: '00:00', close: '00:00', isClosed: true },
    ]
  }],
  services: [...MOCK_SERVICES_DATA],
  barbers: [...MOCK_BARBERS_DATA],
  bookings: [...MOCK_BOOKINGS_DATA],
  reviews: [...MOCK_REVIEWS_DATA],
  plans: [...PLANS],
};

// Function to get user profile after login
export const getUserProfile = async (userId: string): Promise<User | null> => {
  console.log('Mock getUserProfile for userId:', userId);
  await new Promise(resolve => setTimeout(resolve, 100));
  const user = mockDatabase.users.find(u => u.id === userId);
  return user || null;
};

// Function to update user profile
export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<User | null> => {
  console.log('Mock updateUserProfile for userId:', userId, 'with updates:', updates);
  await new Promise(resolve => setTimeout(resolve, 300));
  const userIndex = mockDatabase.users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    mockDatabase.users[userIndex] = { ...mockDatabase.users[userIndex], ...updates };
    return mockDatabase.users[userIndex];
  }
  return null;
};

// Export the mock client
export const supabase = mockSupabaseClient;

// Example function to fetch barbershop details for public page
export const getBarbershopDetails = async (barbershopId: string): Promise<Barbershop | null> => {
    const { data: barbershopData, error } = await supabase
        .from<Barbershop>('barbershops')
        .eq('id', barbershopId)
        .select() 
        .single();

    if (error || !barbershopData) {
        console.error("Error fetching barbershop details or not found:", error);
        return null;
    }
    
    // Manually simulate fetching the owner, as the mock select doesn't handle foreign table joins like `owner:users(*)`
    const owner = mockDatabase.users.find(u => u.id === barbershopData.ownerId);
    if (owner) {
        // @ts-ignore - attaching owner to the result for the component
        barbershopData.owner = owner;
    }
    
    return barbershopData;
};


export const getServicesForBarbershop = async (barbershopId: string): Promise<Service[]> => {
    const {data, error} = await supabase.from<Service>('services').eq('barbershopId', barbershopId).select();
    if(error) {
        console.error("Error fetching services for barbershop:", error);
        return [];
    }
    return data?.filter(s => s.isActive) || [];
};

export const getBarbersForBarbershop = async (barbershopId: string): Promise<Barber[]> => {
    const {data, error} = await supabase.from<Barber>('barbers').eq('barbershopId', barbershopId).select();
     if(error) {
        console.error("Error fetching barbers for barbershop:", error);
        return [];
    }
    return data || [];
};

export const getReviewsForBarbershop = async (barbershopId: string): Promise<Review[]> => {
    const {data, error} = await supabase.from<Review>('reviews').eq('barbershopId', barbershopId).select();
    if(error) {
        console.error("Error fetching reviews for barbershop:", error);
        return [];
    }
    return data?.filter(r => r.isApproved) || [];
};

// Function to get available time slots (complex logic, highly simplified mock)
export const getAvailableTimeSlots = async (barbershopId: string, barberId: string, serviceId: string, date: string): Promise<string[]> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    const service = mockDatabase.services.find(s => s.id === serviceId);
    const barber = mockDatabase.barbers.find(b => b.id === barberId);
    if (!service || (!barber && barberId !== 'any_available_mock')) { // Allow if barberId is a special 'any' case
      console.warn("Service or Barber not found for getAvailableTimeSlots", {serviceId, barberId});
      return [];
    }


    // Mock: return fixed slots for any future date, ignore actual availability/bookings for simplicity
    const slots = ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30", "16:00"];
    
    // Simulate some slots being taken
    const existingBookingsOnDate = mockDatabase.bookings.filter(
      b => (b.barberId === barberId || barberId === 'any_available_mock') && // If any barber, don't filter by specific barber for conflicts.
           b.startTime.startsWith(date) && 
           b.status !== BookingStatus.CANCELLED_ADMIN && 
           b.status !== BookingStatus.CANCELLED_CLIENT
    );

    const availableSlots = slots.filter(slotTime => {
      const slotDateTime = new Date(`${date}T${slotTime}:00`);
      // Check if this slot overlaps with any existing booking for the barber
      return !existingBookingsOnDate.some(booking => {
        const bookingStart = new Date(booking.startTime);
        const bookingEnd = new Date(booking.endTime);
        // Simplified check: if slot start time falls within a booking
        return slotDateTime >= bookingStart && slotDateTime < bookingEnd;
      });
    });

    return availableSlots;
};

// Function to create a booking
export const createBooking = async (bookingData: Omit<Booking, 'id' | 'endTime' | 'createdAt' | 'status'>): Promise<Booking> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const service = mockDatabase.services.find(s => s.id === bookingData.serviceId);
    if (!service) throw new Error("Service not found");

    const startTime = new Date(bookingData.startTime);
    const endTime = new Date(startTime.getTime() + service.duration * 60000);

    const newBooking: Booking = {
        ...bookingData,
        id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        endTime: endTime.toISOString(),
        createdAt: new Date().toISOString(),
        status: BookingStatus.CONFIRMED, // Auto-confirm for this mock
    };
    mockDatabase.bookings.push(newBooking);
    console.log("Mock booking created: ", newBooking);
    // Simulate sending email confirmation
    console.log(`Simulating email confirmation for ${newBooking.clientEmail} for booking ${newBooking.id}`);
    return newBooking;
};

// Simulate changing user plan (e.g. after "payment")
export const updateUserPlan = async (userId: string, newPlan: PlanTier): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const userIndex = mockDatabase.users.findIndex(u => u.id === userId);
    if (userIndex > -1 && mockDatabase.users[userIndex].role === UserRole.ADMIN) {
        mockDatabase.users[userIndex].currentPlan = newPlan;
        mockDatabase.users[userIndex].planExpiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now
        console.log(`User ${userId} plan updated to ${newPlan}`);
        return mockDatabase.users[userIndex];
    }
    return null;
}

export default supabase;
