import { create } from 'zustand';
import type { FieldFeature } from './types';
import { MOCK_FIELDS } from './mockFields';

interface FieldStore {
  fields: FieldFeature[];
  activeFieldId: string;
  setActiveFieldId: (id: string) => void;
  getActiveField: () => FieldFeature | undefined;
}

export const useFieldStore = create<FieldStore>((set, get) => ({
  fields: MOCK_FIELDS,
  activeFieldId: MOCK_FIELDS[0]?.properties.id ?? '',
  setActiveFieldId: (id: string) => set({ activeFieldId: id }),
  getActiveField: () => {
    const { fields, activeFieldId } = get();
    return fields.find((f) => f.properties.id === activeFieldId);
  },
}));
