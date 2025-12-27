import { create } from 'zustand';

const usePathwayStore = create((set, get) => ({
  pathways: [],
  currentPathway: null,
  pathwayStatus: null,
  statusCache: {}, // Map of pathwayId -> status object
  statusCacheExpiry: {}, // Map of pathwayId -> expiry timestamp
  loading: false,
  error: null,

  setPathways: (pathways) => set({ pathways }),

  setCurrentPathway: (pathway) => set({ currentPathway: pathway }),

  addPathway: (pathway) =>
    set((state) => ({
      pathways: [...state.pathways, pathway],
    })),

  updatePathway: (pathwayId, updates) =>
    set((state) => ({
      pathways: state.pathways.map((p) =>
        p.id === pathwayId ? { ...p, ...updates } : p
      ),
      currentPathway:
        state.currentPathway?.id === pathwayId
          ? { ...state.currentPathway, ...updates }
          : state.currentPathway,
    })),

  setPathwayStatus: (pathwayId, status) =>
    set((state) => ({
      pathwayStatus: status,
      statusCache: {
        ...state.statusCache,
        [pathwayId]: status,
      },
      statusCacheExpiry: {
        ...state.statusCacheExpiry,
        [pathwayId]: Date.now() + 30000, // 30-second cache TTL
      },
    })),

  // Check if cached status is still valid (not expired)
  isCacheValid: (pathwayId) => {
    const state = get();
    const expiry = state.statusCacheExpiry[pathwayId];
    if (!expiry) return false;
    return Date.now() < expiry;
  },

  // Get cached status if valid
  getCachedStatus: (pathwayId) => {
    const state = get();
    if (state.isCacheValid(pathwayId)) {
      return state.statusCache[pathwayId];
    }
    return null;
  },

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),
}));

export default usePathwayStore;
