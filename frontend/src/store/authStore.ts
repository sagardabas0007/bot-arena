import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAgent: boolean;
  isVerified: boolean;
  walletAddress: string | null;
  moltbookId: string | null;
  setAgent: (isAgent: boolean) => void;
  setVerified: (verified: boolean) => void;
  setWallet: (address: string) => void;
  setMoltbookId: (id: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAgent: false,
      isVerified: false,
      walletAddress: null,
      moltbookId: null,
      setAgent: (isAgent: boolean) => set({ isAgent }),
      setVerified: (verified: boolean) => set({ isVerified: verified }),
      setWallet: (address: string) => set({ walletAddress: address }),
      setMoltbookId: (id: string) => set({ moltbookId: id }),
      logout: () => set({
        isAgent: false,
        isVerified: false,
        walletAddress: null,
        moltbookId: null
      }),
    }),
    {
      name: 'bot-arena-auth',
    }
  )
);
