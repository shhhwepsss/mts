export type MotorcycleType = 'ENDURO';

export interface Motorcycle {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  type: MotorcycleType;
  currentHours: number;
  imageUrl: string | null;
}

export interface CreateMotorcycleParams {
  name: string;
  brand: string;
  model: string;
  year: number;
  type: MotorcycleType;
  currentHours: number;
  imageUrl?: string;
}

export interface UpdateMotorcycleParams {
  name?: string;
  brand?: string;
  model?: string;
  year?: number;
  type?: MotorcycleType;
  imageUrl?: string;
}
