import { create } from 'zustand';

export type ToastType = 'error' | 'success' | 'info';

export interface ToastState {
  message: string | null;
  type: ToastType;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: 'error',
  showToast: (message, type = 'error') => set({ message, type }),
  hideToast: () => set({ message: null }),
}));
