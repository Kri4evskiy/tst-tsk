export type PointType = 'SOIL_SAMPLE' | 'PESTS' | 'PLANT_DISEASE' | 'OTHER';

export interface PointTypeConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconName: 'FlaskConical' | 'Bug' | 'Leaf' | 'MapPin';
}

export const POINT_TYPE_CONFIGS: Record<PointType, PointTypeConfig> = {
  SOIL_SAMPLE: {
    label: 'Проба ґрунту',
    color: '#d97706', // amber-600
    bgColor: '#fef3c7', // amber-100
    borderColor: '#b45309', // amber-700
    iconName: 'FlaskConical',
  },
  PESTS: {
    label: 'Шкідники',
    color: '#dc2626', // red-600
    bgColor: '#fee2e2', // red-100
    borderColor: '#b91c1c', // red-700
    iconName: 'Bug',
  },
  PLANT_DISEASE: {
    label: 'Хвороби рослин',
    color: '#ea580c', // orange-600
    bgColor: '#ffedd5', // orange-100
    borderColor: '#c2410c', // orange-700
    iconName: 'Leaf',
  },
  OTHER: {
    label: 'Інше',
    color: '#2563eb', // blue-600
    bgColor: '#dbeafe', // blue-100
    borderColor: '#1d4ed8', // blue-700
    iconName: 'MapPin',
  },
};
