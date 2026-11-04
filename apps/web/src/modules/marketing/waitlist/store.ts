import { create } from "zustand";

interface WaitlistStore {
  email: string | null;
  setEmail: (email: string | null) => void;
}

export const useWaitlistStore = create<WaitlistStore>((set) => ({
  email: null,
  setEmail: (email) => set({ email }),
}));
