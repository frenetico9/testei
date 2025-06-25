
// This is a MOCK Supabase service. In a real app, you'd use @supabase/supabase-js.
import { 
    User, SupabaseAuthUser, SupabaseResponse, 
    Barbershop, Service, Barber, Booking, Review, Plan, PlanTier, UserRole, BookingStatus, 
    OperatingHours, AvailabilitySlot
} from '../types';
import { 
    MOCK_BARBERSHOP_ID, MOCK_SERVICES_DATA, MOCK_BARBERS_DATA, MOCK_BOOKINGS_DATA, 
    MOCK_CLIENTS_DATA, MOCK_REVIEWS_DATA, PLANS, MOCK_BARBERSHOP_DETAILS_DATA, APP_NAME,
    DEFAULT_BARBER_AVAILABILITY, DAYS_OF_WEEK
} from '../constants';
import moment from 'moment';


// --- START: Mock Database Definition ---
const mockAdminUser: User = {
    id: 'admin_user_id_001',
    name: 'Admin User Navalha',
    email: 'admin@example.com',
    phone: '11999998888',
    role: UserRole.ADMIN,
    barbershopId: MOCK_BARBERSHOP_ID,
    currentPlan: PlanTier.PREMIUM,
    planExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 
};

let mockDatabase: {
    users: User[];
    barbershops: Barbershop[];
    services: Service[];
    barbers: Barber[];
    bookings: Booking[];
    reviews: Review[];
} = {
    users: [mockAdminUser, ...MOCK_CLIENTS_DATA.map(c => ({...c, id: c.id || `client_${Math.random().toString(36).substr(2, 9)}`}))],
    barbershops: [{ ...MOCK_BARBERSHOP_DETAILS_DATA, id: MOCK_BARBERSHOP_DETAILS_DATA.id || MOCK_BARBERSHOP_ID }],
    services: [...MOCK_SERVICES_DATA.map(s => ({...s, id: s.id || `serv_${Math.random().toString(36).substr(2, 9)}`}))],
    barbers: [...MOCK_BARBERS_DATA.map(b => ({...b, id: b.id || `barber_${Math.random().toString(36).substr(2, 9)}`}))],
    bookings: [...MOCK_BOOKINGS_DATA.map(b => ({...b, id: b.id || `booking_${Math.random().toString(36).substr(2, 9)}`}))],
    reviews: [...MOCK_REVIEWS_DATA.map(r => ({...r, id: r.id || `review_${Math.random().toString(36).substr(2, 9)}`}))],
};
// --- END: Mock Database Definition ---


// Simulate a Supabase client
const mockSupabaseClient = {
  auth: {
    signUp: async ({ email, password, options }: any): Promise<SupabaseResponse<{ user: SupabaseAuthUser | null; session: any | null }>> => {
      console.log('Mock Supabase signUp:', { email, password, options });
      await new Promise(resolve => setTimeout(resolve, 500));
      if (mockDatabase.users.find(u => u.email === email)) { // Check if email exists in our mock users
        return { data: { user: null, session: null }, error: new Error('User already registered') };
      }
      const newUserSupabaseAuth: SupabaseAuthUser = { id: `user_${Date.now()}_${Math.random().toString(36).substr(2,5)}`, email };
      const newUserProfile: User = { 
        id: newUserSupabaseAuth.id, 
        email, 
        name: options?.data?.name || 'New User', 
        phone: options?.data?.phone || '', 
        role: options?.data?.role || UserRole.CLIENT,
        currentPlan: options?.data?.role === UserRole.ADMIN ? PlanTier.FREE : undefined, 
        planExpiryDate: options?.data?.role === UserRole.ADMIN ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        barbershopId: (options?.data?.role === UserRole.ADMIN) ? `bs_${Date.now()}_${Math.random().toString(36).substr(2,5)}` : undefined
      };
      mockDatabase.users.push(newUserProfile);
      
      if(newUserProfile.role === UserRole.ADMIN && newUserProfile.barbershopId) {
        const newBarbershop: Barbershop = {
          id: newUserProfile.barbershopId,
          name: `${newUserProfile.name}'s Barbershop` || `${APP_NAME} Default`, 
          ownerId: newUserProfile.id,
          address: 'Endereço não definido',
          description: 'Descreva sua barbearia aqui.',
          logoUrl: MOCK_BARBERSHOP_DETAILS_DATA.logoUrl || 'https://via.placeholder.com/150/0D1F2D/FFFFFF?text=ND', 
          photos: MOCK_BARBERSHOP_DETAILS_DATA.photos?.slice(0,1) || [], 
          operatingHours: MOCK_BARBERSHOP_DETAILS_DATA.operatingHours || DEFAULT_BARBER_AVAILABILITY.map(d => ({day: d.dayOfWeek, open: d.startTime, close: d.endTime, isClosed: !d.isWorking})),
          phone: newUserProfile.phone
        };
        mockDatabase.barbershops.push(newBarbershop);
      }
      return { data: { user: newUserSupabaseAuth, session: { access_token: 'mock_token', user: newUserSupabaseAuth, expires_at: Date.now() + 3600*1000 } }, error: null };
    },
    signInWithPassword: async ({ email, password }: any): Promise<SupabaseResponse<{ user: SupabaseAuthUser | null; session: any | null }>> => {
      console.log('Mock Supabase signInWithPassword:', { email, password });
      await new Promise(resolve => setTimeout(resolve, 500));
      const foundUser = mockDatabase.users.find(u => u.email === email); 
      if (foundUser) { // In a real app, Supabase checks the password.
        const authUser: SupabaseAuthUser = { id: foundUser.id, email: foundUser.email };
        return { data: { user: authUser, session: { access_token: 'mock_token', user: authUser, expires_at: Date.now() + 3600*1000 } }, error: null };
      }
      return { data: { user: null, session: null }, error: new Error('Invalid login credentials') };
    },
    signOut: async (): Promise<SupabaseResponse<null>> => {
      console.log('Mock Supabase signOut');
      await new Promise(resolve => setTimeout(resolve, 200));
      // Simulate clearing the session by making getSession return null next time (if we had session state)
      return { data: null, error: null };
    },
    getSession: async (): Promise<SupabaseResponse<{ session: any | null }>> => {
    //   console.log('Mock Supabase getSession');
      // For persistent mock session during dev, return admin user. For real logout testing, this needs state.
      // const user = mockDatabase.users.find(u => u.id === mockAdminUser.id);
      // Let's simulate no session by default unless login occurs
      // This part is tricky for a stateless mock. A real app relies on browser storage.
      // For now, let's assume if there's an admin user, they are "logged in".
      if (mockAdminUser && mockDatabase.users.find(u=>u.id === mockAdminUser.id)) { // A way to simulate being logged in as admin
         const authUser: SupabaseAuthUser = { id: mockAdminUser.id, email: mockAdminUser.email };
         return { data: { session: { access_token: 'mock_token', user: authUser, expires_at: Date.now() + 3600*1000 } }, error: null };
      }
      return { data: { session: null }, error: null };
    },
    updateUser: async (credentials: any): Promise<SupabaseResponse<{ user: SupabaseAuthUser | null}>> => {
        console.log('Mock Supabase updateUser:', credentials);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const currentAuthSession = await mockSupabaseClient.auth.getSession(); // Get current "logged in" user
        if (!currentAuthSession?.data?.session?.user) {
            return { data: { user: null }, error: new Error("No authenticated user to update.") };
        }
        const currentAuthUserId = currentAuthSession.data.session.user.id;
        let userProfileToUpdate = mockDatabase.users.find(u => u.id === currentAuthUserId);

        if (userProfileToUpdate) {
            if (credentials.email) {
                 userProfileToUpdate.email = credentials.email;
                 console.log(`Mock: Email for user ${userProfileToUpdate.id} updated to ${credentials.email}. Real Supabase would send confirmation.`);
            }
            if (credentials.password) {
                console.log(`Mock: Password for user ${userProfileToUpdate.id} updated. This is a mock, no actual hashing.`);
            }
            if(credentials.data) { 
                userProfileToUpdate = {...userProfileToUpdate, ...credentials.data};
                const userIndex = mockDatabase.users.findIndex(u=>u.id === userProfileToUpdate!.id); // userProfileToUpdate is guaranteed here
                if(userIndex !== -1) mockDatabase.users[userIndex] = userProfileToUpdate;
            }
             const authUserResponse: SupabaseAuthUser = { id: userProfileToUpdate.id, email: userProfileToUpdate.email };
             return { data: { user: authUserResponse }, error: null };
        }
        return { data: { user: null }, error: new Error('User profile not found for update') };
    },
     onAuthStateChange: (callback: (event: string, session: any | null) => void): { data: { subscription: any } } => {
    //   console.log('Mock Supabase onAuthStateChange registered');
      let mockSubscriptionId = `sub_${Date.now()}`;
      setTimeout(async () => {
        const {data} = await mockSupabaseClient.auth.getSession();
        // console.log("Mock onAuthStateChange: Initial session state", data.session ? "SIGNED_IN" : "SIGNED_OUT");
        callback(data.session ? "SIGNED_IN" : "SIGNED_OUT", data.session);
      }, 50);
      return { data: { subscription: { unsubscribe: () => console.log(`Mock unsubscribed from auth changes: ${mockSubscriptionId}`) } } };
    },
    resetPasswordForEmail: async (email: string, options?: { redirectTo?: string }): Promise<{ data: {}; error: Error | null }> => {
        console.log(`Mock Supabase resetPasswordForEmail for ${email}. Redirect to: ${options?.redirectTo}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        const userExists = mockDatabase.users.some(u => u.email === email);
        if (!userExists) {
            console.warn(`Mock: Password reset requested for non-existent email: ${email}`);
        }
        return { data: {}, error: null };
    },
  },
  from: function<T extends {id: string | number}>(tableName: string) {
    let _currentFilter: { column: string, value: any, type?: 'eq' | 'in' } | null = null;
    let _limit: number | null = null;
    let _order: { column: string, ascending: boolean } | null = null;

    const self = {
      eq: (column: string, value: any): typeof self => {
        // console.log(`Mock Supabase .eq('${column}', '${value}') on ${tableName}`);
        _currentFilter = { column, value, type: 'eq' };
        return self;
      },
      in: (column: string, values: any[]): typeof self => {
        // console.log(`Mock Supabase .in('${column}', [${values.join(',')}]) on ${tableName}`);
        _currentFilter = { column, value: values, type: 'in'};
        return self;
      },
      limit: (count: number): typeof self => {
        _limit = count;
        return self;
      },
      order: (column: string, { ascending }: { ascending: boolean }): typeof self => {
        _order = { column, ascending };
        return self;
      },
      select: async (query?: string): Promise<SupabaseResponse<T[]>> => {
        // console.log(`Mock Supabase select from ${tableName} with query: ${query}, filter:`, _currentFilter);
        await new Promise(resolve => setTimeout(resolve, 50)); 
        
        let results = (mockDatabase[tableName as keyof typeof mockDatabase] || []) as T[];
        
        if (_currentFilter) {
          if (_currentFilter.type === 'in') {
            const valuesToMatch = _currentFilter.value as any[];
            results = results.filter(item => {
                const itemValue = (item as any)[_currentFilter!.column];
                return valuesToMatch.includes(itemValue);
            });
          } else { 
            results = results.filter(item => (item as any)[_currentFilter!.column] === _currentFilter!.value);
          }
        }
        
        if (query && query !== '*') {
           console.warn("Mock Supabase 'select' with query string beyond '*' is not fully implemented. Filter with .eq() or .in(). Query received:", query);
        }


        if (_order) {
            results = [...results].sort((a, b) => { // Create a new array for sorting
                const valA = (a as any)[_order!.column];
                const valB = (b as any)[_order!.column];
                if (valA < valB) return _order!.ascending ? -1 : 1;
                if (valA > valB) return _order!.ascending ? 1 : -1;
                return 0;
            });
        }

        if (_limit !== null) {
            results = results.slice(0, _limit);
        }
        // console.log(`Mock results for ${tableName}:`, results.length);
        return { data: results, error: null };
      },
      insert: async (records: Partial<T> | Partial<T>[]): Promise<SupabaseResponse<T[]>> => {
        console.log(`Mock Supabase insert into ${tableName}`, records);
        await new Promise(resolve => setTimeout(resolve, 50));
        const table = mockDatabase[tableName as keyof typeof mockDatabase] as T[];
        const newRecords: T[] = [];
        const itemsToInsert = Array.isArray(records) ? records : [records];

        for (const record of itemsToInsert) {
            const newId = `${tableName.slice(0,4)}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            const fullRecord = { ...record, id: newId, createdAt: new Date().toISOString() } as T;
            table.push(fullRecord);
            newRecords.push(fullRecord);
        }
        console.log(`Mock DB ${tableName} after insert:`, table.length);
        return { data: newRecords, error: null };
      },
      update: async (values: Partial<T>): Promise<SupabaseResponse<T[]>> => {
        console.log(`Mock Supabase update ${tableName} with filter:`, _currentFilter, 'values:', values);
        await new Promise(resolve => setTimeout(resolve, 50));
        if (!_currentFilter || !_currentFilter.column || _currentFilter.value === undefined) {
            console.error("Update requires a valid filter (e.g., .eq('id', value)). Filter provided:", _currentFilter);
            return { data: null, error: new Error("Update requires a filter (e.g., .eq('id', value)).") };
        }
        const table = mockDatabase[tableName as keyof typeof mockDatabase] as T[];
        const updatedRecords: T[] = [];
        let found = false;
        for (let i = 0; i < table.length; i++) {
            if ((table[i] as any)[_currentFilter.column] === _currentFilter.value) {
                table[i] = { ...table[i], ...values, updatedAt: new Date().toISOString() } as T; // Add updatedAt timestamp
                updatedRecords.push(table[i]);
                found = true;
            }
        }
        if (!found && updatedRecords.length === 0) { // Check if any records were actually updated
             console.warn(`Mock Supabase update: No record found in ${tableName} to update with filter:`, _currentFilter);
            // Supabase might not return an error if no rows match, but an empty data array.
            // For mock, returning error might be more helpful for debugging.
            // return { data: [], error: new Error("No record found to update with the given filter.")};
            return { data: [], error: null }; // Or return empty data with no error
        }
        return { data: updatedRecords, error: null };
      },
       delete: async (): Promise<SupabaseResponse<T[]>> => {
        console.log(`Mock Supabase delete from ${tableName} with filter:`, _currentFilter);
        await new Promise(resolve => setTimeout(resolve, 50));
        if (!_currentFilter) {
             return { data: null, error: new Error("Delete requires a filter (e.g., .eq()).") };
        }
        const table = mockDatabase[tableName as keyof typeof mockDatabase] as T[];
        const deletedRecords: T[] = [];
        
        const newTable = table.filter(item => {
            if ((item as any)[_currentFilter!.column] === _currentFilter!.value) {
                deletedRecords.push(item);
                return false; 
            }
            return true;
        });
        (mockDatabase[tableName as keyof typeof mockDatabase] as T[]) = newTable;

        return { data: deletedRecords, error: null };
      },
    };
    return self;
  },
};

export const supabase = mockSupabaseClient;

// --- START: Exported Service Functions ---
export const getUserProfile = async (userId: string): Promise<User | null> => {
//   console.log(`Mock getUserProfile for userId: ${userId}`);
  await new Promise(resolve => setTimeout(resolve, 50));
  const user = mockDatabase.users.find(u => u.id === userId);
  return user || null;
};

export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<User | null> => {
  console.log(`Mock updateUserProfile for userId: ${userId} with updates:`, updates);
  await new Promise(resolve => setTimeout(resolve, 50));
  const userIndex = mockDatabase.users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    mockDatabase.users[userIndex] = { ...mockDatabase.users[userIndex], ...updates };
    return mockDatabase.users[userIndex];
  }
  return null;
};

export const getBarbershopDetails = async (barbershopId: string): Promise<Barbershop | null> => {
//   console.log(`Mock getBarbershopDetails for barbershopId: ${barbershopId}`);
  await new Promise(resolve => setTimeout(resolve, 50));
  if (barbershopId === MOCK_BARBERSHOP_ID && MOCK_BARBERSHOP_DETAILS_DATA.id === MOCK_BARBERSHOP_ID) { // Ensure mock data matches
      return MOCK_BARBERSHOP_DETAILS_DATA;
  }
  const found = mockDatabase.barbershops.find(bs => bs.id === barbershopId);
  return found || MOCK_BARBERSHOP_DETAILS_DATA; // Fallback to general mock if specific not found
};

export const getServicesForBarbershop = async (barbershopId: string): Promise<Service[]> => {
//   console.log(`Mock getServicesForBarbershop for barbershopId: ${barbershopId}`);
  await new Promise(resolve => setTimeout(resolve, 50));
  return mockDatabase.services.filter(s => s.barbershopId === barbershopId);
};

export const getBarbersForBarbershop = async (barbershopId: string): Promise<Barber[]> => {
//   console.log(`Mock getBarbersForBarbershop for barbershopId: ${barbershopId}`);
  await new Promise(resolve => setTimeout(resolve, 50));
  return mockDatabase.barbers.filter(b => b.barbershopId === barbershopId);
};

export const getReviewsForBarbershop = async (barbershopId: string): Promise<Review[]> => {
//   console.log(`Mock getReviewsForBarbershop for barbershopId: ${barbershopId}`);
  await new Promise(resolve => setTimeout(resolve, 50));
  return mockDatabase.reviews.filter(r => r.barbershopId === barbershopId);
};

export const getAvailableTimeSlots = async (
  barbershopId: string, 
  barberIdQuery: string | null, // Can be 'any_available_mock' or null
  serviceId: string, 
  date: string // YYYY-MM-DD
): Promise<string[]> => {
  console.log(`Mock getAvailableTimeSlots for barbershop: ${barbershopId}, barber: ${barberIdQuery}, service: ${serviceId}, date: ${date}`);
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const service = mockDatabase.services.find(s => s.id === serviceId);
  if (!service) {
      console.error("Service not found for getAvailableTimeSlots:", serviceId);
      return [];
  }

  const effectiveBarberId = barberIdQuery === 'any_available_mock' ? null : barberIdQuery;
  const barber = effectiveBarberId ? mockDatabase.barbers.find(b => b.id === effectiveBarberId) : null;
  
  const slots: string[] = [];
  const selectedDateObj = moment(date, "YYYY-MM-DD");
  const dayName = selectedDateObj.format('dddd') as AvailabilitySlot['dayOfWeek']; // moment format 'dddd' gives full day name
  
  let dayAvailability: AvailabilitySlot | undefined;
  let shopDayHoursDefinition: OperatingHours | undefined;

  const shopDetails = mockDatabase.barbershops.find(bs => bs.id === barbershopId);
  if (shopDetails && shopDetails.operatingHours) {
      shopDayHoursDefinition = shopDetails.operatingHours.find(oh => oh.day.toLowerCase() === dayName.toLowerCase() && !oh.isClosed);
  }


  if (barber && barber.availability) {
      dayAvailability = barber.availability.find(a => a.dayOfWeek.toLowerCase() === dayName.toLowerCase() && a.isWorking);
      if (!dayAvailability && shopDayHoursDefinition) { // Barber works but uses general shop hours for that day
           dayAvailability = { dayOfWeek: dayName, startTime: shopDayHoursDefinition.open, endTime: shopDayHoursDefinition.close, isWorking: true };
      }
  } else if (!barber && shopDayHoursDefinition) { // 'Any barber' or barber without specific schedule, use shop hours
      dayAvailability = { dayOfWeek: dayName, startTime: shopDayHoursDefinition.open, endTime: shopDayHoursDefinition.close, isWorking: true };
  }


  if (dayAvailability) {
      let currentTime = moment(dayAvailability.startTime, 'HH:mm');
      const endTime = moment(dayAvailability.endTime, 'HH:mm');
      const serviceDuration = service.duration; 

      while(currentTime.clone().add(serviceDuration, 'minutes').isSameOrBefore(endTime)) {
          const proposedSlotStartTime = moment(date + 'T' + currentTime.format('HH:mm'));
          const proposedSlotEndTime = proposedSlotStartTime.clone().add(serviceDuration, 'minutes');

          const isSlotTaken = mockDatabase.bookings.some(b => {
              // Check only if barber matches (or if any barber is fine, then any booking at that time)
              const barberMatch = !effectiveBarberId || b.barberId === effectiveBarberId;
              if (b.barbershopId === barbershopId && barberMatch && moment(b.startTime).isSame(proposedSlotStartTime, 'day')) {
                const bookingStart = moment(b.startTime);
                const bookingEnd = moment(b.endTime);
                return proposedSlotStartTime.isBefore(bookingEnd) && proposedSlotEndTime.isAfter(bookingStart);
              }
              return false;
          });
          
          if (!isSlotTaken) {
              slots.push(currentTime.format('HH:mm'));
          }
          // Increment by a fixed interval, e.g., service duration or 15/30 mins
          currentTime.add(30, 'minutes'); 
      }
  } else {
    // console.log("No availability found for barber/shop on", dayName);
  }
  
  // console.log("Generated slots:", slots);
  if (slots.length === 0 && dayAvailability) { // Fallback if specific logic produced nothing but day is theoretically open
       console.warn("Time slot generation resulted in 0 slots, providing fallback for open day.");
       return ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].filter(sl => {
           const slotTime = moment(sl, 'HH:mm');
           const slotEndTime = slotTime.clone().add(service.duration, 'minutes');
           return dayAvailability && slotTime.isSameOrAfter(moment(dayAvailability.startTime, 'HH:mm')) && slotEndTime.isSameOrBefore(moment(dayAvailability.endTime, 'HH:mm'));
       });
  }
  return slots;
};

export const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'endTime' | 'status'> & { priceAtBooking: number } ): Promise<Booking> => {
  console.log('Mock createBooking with data:', bookingData);
  await new Promise(resolve => setTimeout(resolve, 300));

  const service = mockDatabase.services.find(s => s.id === bookingData.serviceId && s.barbershopId === bookingData.barbershopId);
  if (!service) throw new Error("Serviço não encontrado para criar agendamento.");

  const newBookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2,5)}`;
  const startTime = new Date(bookingData.startTime);
  const endTime = new Date(startTime.getTime() + service.duration * 60000); // duration in minutes

  const newBooking: Booking = {
    ...bookingData, // Spread the incoming data first
    id: newBookingId,
    endTime: endTime.toISOString(),
    status: BookingStatus.CONFIRMED, // Default to confirmed for mock
    createdAt: new Date().toISOString(),
  };
  mockDatabase.bookings.push(newBooking);
  console.log("Mock DB bookings after insert:", mockDatabase.bookings.length);
  return newBooking;
};

export const updateUserPlan = async (userId: string, newPlanId: PlanTier): Promise<User | null> => {
  console.log(`Mock updateUserPlan for userId: ${userId} to plan: ${newPlanId}`);
  await new Promise(resolve => setTimeout(resolve, 200));
  const userIndex = mockDatabase.users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    const planDetails = PLANS.find(p => p.id === newPlanId);
    if (!planDetails) throw new Error("Plano inválido selecionado.");
    
    mockDatabase.users[userIndex].currentPlan = newPlanId;
    mockDatabase.users[userIndex].planExpiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // Mock: 30 days expiry
    return mockDatabase.users[userIndex];
  }
  return null;
};

// --- END: Exported Service Functions ---
