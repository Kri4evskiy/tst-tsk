import { create } from 'zustand';

interface AddPointModalState {
  isOpen: boolean;
  lat: number;
  lng: number;
  mgrs: string;
  openModal: (data: { lat: number; lng: number; mgrs: string }) => void;
  closeModal: () => void;
}

export const useAddPointModalStore = create<AddPointModalState>((set) => ({
  isOpen: false,
  lat: 0,
  lng: 0,
  mgrs: '',
  openModal: ({ lat, lng, mgrs }) =>
    set({
      isOpen: true,
      lat,
      lng,
      mgrs,
    }),
  closeModal: () =>
    set({
      isOpen: false,
    }),
}));
