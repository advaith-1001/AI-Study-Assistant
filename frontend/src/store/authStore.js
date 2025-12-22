import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null, // Always start null
  isAuthenticated: false,
  isInitialCheckDone: false, 
  
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user, 
    isInitialCheckDone: true 
  }),

  setInitialCheckDone: (val) => set({ isInitialCheckDone: val }),

  logout: () => {
    // Note: If using HttpOnly cookies, the backend must clear the cookie.
    // Frontend just clears the local state.
    set({ user: null, isAuthenticated: false, isInitialCheckDone: true });
  },
}));

export default useAuthStore;