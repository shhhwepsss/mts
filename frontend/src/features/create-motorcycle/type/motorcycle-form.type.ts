import type { CreateMotorcycleParams, Motorcycle } from '@/entities/motorcycle';

export interface MotorcycleFormProps {
  initialValue?: Motorcycle;
  submitLabel?: string;
  isSubmitting?: boolean;
  onSubmit: (params: CreateMotorcycleParams) => void;
  onCancel?: () => void;
}
