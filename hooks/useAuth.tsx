
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, getUserProfile, updateUserProfile as apiUpdateUserProfile } from '../services/supabaseService';
import { User, SupabaseAuthUser, UserRole, PlanTier } from '../types';

interface AuthContextType {
  currentUser: User | null;
  supabaseUser: SupabaseAuthUser | null;
  loadingAuth: boolean;
  login: (email: string, pass: string) => Promise<User | null>;
  register: (name: string, email: string, phone: string, pass: string, role?: UserRole) => Promise<User | null>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseAuthUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const fetchAndSetUserProfile = useCallback(async (authUserId: string) => {
    setLoadingAuth(true);
    try {
      const profile = await getUserProfile(authUserId);
      setCurrentUser(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setCurrentUser(null); // Clear profile on error
    } finally {
      // setLoadingAuth(false); // Managed by onAuthStateChange or checkSession
    }
  }, []);
  
  useEffect(() => {
    const checkSession = async () => {
      setLoadingAuth(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
      }
      if (session?.user) {
        setSupabaseUser(session.user);
        await fetchAndSetUserProfile(session.user.id);
      } else {
        setCurrentUser(null);
        setSupabaseUser(null);
      }
      setLoadingAuth(false);
    };

    // checkSession(); // onAuthStateChange will cover initial state as well

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoadingAuth(true);
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        // console.log("Auth state change: SIGNED_IN", session.user.id);
        await fetchAndSetUserProfile(session.user.id);
      } else {
        // console.log("Auth state change: SIGNED_OUT");
        setCurrentUser(null);
      }
      setLoadingAuth(false);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAndSetUserProfile]);


  const login = async (email: string, password: string):Promise<User | null> => {
    setLoadingAuth(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Login error:', error.message);
      setLoadingAuth(false);
      throw error;
    }
    if (data.user) {
      // onAuthStateChange should handle setting user and profile
      // setSupabaseUser(data.user); 
      // const profile = await getUserProfile(data.user.id);
      // setCurrentUser(profile);
      // setLoadingAuth(false);
      // return profile;
      // Let onAuthStateChange handle the update. It might take a moment.
      // For immediate feedback, we can optimistically fetch here too.
      const profile = await getUserProfile(data.user.id);
      setCurrentUser(profile);
      setSupabaseUser(data.user)
      setLoadingAuth(false);
      return profile
    }
    setLoadingAuth(false);
    return null;
  };

  const register = async (name: string, email: string, phone: string, password: string, role: UserRole = UserRole.CLIENT): Promise<User | null> => {
    setLoadingAuth(true);
    const options = {
      data: { 
        name, 
        phone, 
        role,
        currentPlan: role === UserRole.ADMIN ? PlanTier.FREE : undefined,
      }
    };
    const { data, error } = await supabase.auth.signUp({ email, password, options });
    if (error) {
      console.error('Registration error:', error.message);
      setLoadingAuth(false);
      throw error;
    }
    if (data.user) {
      // onAuthStateChange should handle setting user and profile
      // const profile = await getUserProfile(data.user.id);
      // setCurrentUser(profile);
      // setSupabaseUser(data.user);
      // setLoadingAuth(false);
      // return profile;
      // Let onAuthStateChange handle the update.
      // For immediate feedback after registration:
      const profile = await getUserProfile(data.user.id);
      setCurrentUser(profile);
      setSupabaseUser(data.user)
      setLoadingAuth(false);
      return profile
    }
    setLoadingAuth(false);
    return null;
  };

  const logout = async () => {
    setLoadingAuth(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
    }
    // onAuthStateChange will set currentUser and supabaseUser to null
    // setCurrentUser(null);
    // setSupabaseUser(null);
    // setLoadingAuth(false);
  };

  const updateUserProfile = async (updates: Partial<User>): Promise<User | null> => {
    if (!currentUser) return null;
    setLoadingAuth(true);
    try {
      // API call to update the profile in the backend (e.g., 'users' table)
      const updatedUser = await apiUpdateUserProfile(currentUser.id, updates);
      if (updatedUser) {
        setCurrentUser(updatedUser); // Update local state immediately

        // If email was part of 'updates' and needs Supabase auth update
        if (updates.email && supabaseUser && updates.email !== supabaseUser.email) {
            const {data: updateAuthUserData, error: authUserUpdateError } = await supabase.auth.updateUser({ email: updates.email });
            if (authUserUpdateError) {
                console.warn("Failed to update email in Supabase Auth:", authUserUpdateError.message);
                // Potentially revert local email update or notify user
            } else {
                 console.log("Supabase Auth email update initiated (if different). User:", updateAuthUserData?.user);
            }
        }
      }
      return updatedUser;
    } catch (error) {
      console.error("Error updating profile in hook:", error);
      return null;
    } finally {
      setLoadingAuth(false);
    }
  };

  const value = {
    currentUser,
    supabaseUser,
    loadingAuth,
    login,
    register,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
