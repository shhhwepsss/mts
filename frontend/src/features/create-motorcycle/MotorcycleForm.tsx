import { useState, type FormEvent } from 'react';
import { Button, TextInput } from '@/shared/ui';
import type {
  CreateMotorcycleParams,
  Motorcycle,
  MotorcycleType,
} from '@/entities/motorcycle';
import styles from './MotorcycleForm.module.css';

interface MotorcycleFormProps {
  initialValue?: Motorcycle;
  submitLabel?: string;
  isSubmitting?: boolean;
  onSubmit: (params: CreateMotorcycleParams) => void;
  onCancel?: () => void;
}

const TYPES: MotorcycleType[] = ['ENDURO'];

export function MotorcycleForm({
  initialValue,
  submitLabel = 'Save',
  isSubmitting,
  onSubmit,
  onCancel,
}: MotorcycleFormProps) {
  const [name, setName] = useState(initialValue?.name ?? '');
  const [brand, setBrand] = useState(initialValue?.brand ?? '');
  const [model, setModel] = useState(initialValue?.model ?? '');
  const [year, setYear] = useState(String(initialValue?.year ?? new Date().getFullYear()));
  const [type, setType] = useState<MotorcycleType>(initialValue?.type ?? 'ENDURO');
  const [currentHours, setCurrentHours] = useState(String(initialValue?.currentHours ?? 0));
  const [imageUrl, setImageUrl] = useState(initialValue?.imageUrl ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Name is required';
    if (!brand.trim()) next.brand = 'Brand is required';
    if (!model.trim()) next.model = 'Model is required';
    const parsedYear = Number(year);
    if (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > 2100) {
      next.year = 'Year must be between 1900 and 2100';
    }
    const parsedHours = Number(currentHours);
    if (!Number.isFinite(parsedHours) || parsedHours < 0) {
      next.currentHours = 'Hours must be a non-negative number';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: name.trim(),
      brand: brand.trim(),
      model: model.trim(),
      year: Number(year),
      type,
      currentHours: Number(currentHours),
      imageUrl: imageUrl.trim() || undefined,
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <TextInput
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
      />
      <TextInput
        label="Brand"
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
        error={errors.brand}
      />
      <TextInput
        label="Model"
        value={model}
        onChange={(e) => setModel(e.target.value)}
        error={errors.model}
      />
      <div className={styles.row}>
        <TextInput
          label="Year"
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          error={errors.year}
        />
        <div className={styles.field}>
          <label className={styles.label}>Type</label>
          <select
            className={styles.select}
            value={type}
            onChange={(e) => setType(e.target.value as MotorcycleType)}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
      <TextInput
        label="Current Hours"
        type="number"
        step="0.1"
        value={currentHours}
        onChange={(e) => setCurrentHours(e.target.value)}
        error={errors.currentHours}
      />
      <TextInput
        label="Image URL (optional)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />
      <div className={styles.actions}>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
