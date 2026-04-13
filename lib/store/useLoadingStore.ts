import { create } from "zustand"

interface LoadingState {
    loading: boolean
    start: () => void
    stop: () => void
}

export const useLoadingStore = create<LoadingState>((set) => ({
    loading: false,
    start: () => set({ loading: true }),
    stop: () => set({ loading: false }),
}))
