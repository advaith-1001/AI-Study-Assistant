import { create } from 'zustand';

const usePathwayStore = create((set) => ({
  pathways: [],
  currentPathway: null,
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

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),
}));

export default usePathwayStore;
