import { useState, type FormEvent } from 'react';
import { Button, TextInput } from '@/shared/ui';
import { useI18n } from '@/shared/i18n';
import type { MotorcycleType } from '@/entities/motorcycle';
import type { MotorcycleFormProps } from './type/motorcycle-form.type';
import { MOTORCYCLE_TYPES } from './const/motorcycle-types';
import styles from './MotorcycleForm.module.css';

export function MotorcycleForm({
  initialValue,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: MotorcycleFormProps) {
  const { t } = useI18n();
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
    if (!name.trim()) next.name = t('motorcycleForm.errors.nameRequired');
    if (!brand.trim()) next.brand = t('motorcycleForm.errors.brandRequired');
    if (!model.trim()) next.model = t('motorcycleForm.errors.modelRequired');
    const parsedYear = Number(year);
    if (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > 2100) {
      next.year = t('motorcycleForm.errors.yearRange');
    }
    const parsedHours = Number(currentHours);
    if (!Number.isFinite(parsedHours) || parsedHours < 0) {
      next.currentHours = t('motorcycleForm.errors.hoursNonNegative');
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
        label={t('motorcycleForm.name')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
      />
      <TextInput
        label={t('motorcycleForm.brand')}
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
        error={errors.brand}
      />
      <TextInput
        label={t('motorcycleForm.model')}
        value={model}
        onChange={(e) => setModel(e.target.value)}
        error={errors.model}
      />
      <div className={styles.row}>
        <TextInput
          label={t('motorcycleForm.year')}
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          error={errors.year}
        />
        <div className={styles.field}>
          <label className={styles.label}>{t('motorcycleForm.type')}</label>
          <select
            className={styles.select}
            value={type}
            onChange={(e) => setType(e.target.value as MotorcycleType)}
          >
            {MOTORCYCLE_TYPES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
      <TextInput
        label={t('motorcycleForm.currentHours')}
        type="number"
        step="0.1"
        value={currentHours}
        onChange={(e) => setCurrentHours(e.target.value)}
        error={errors.currentHours}
      />
      <TextInput
        label={t('motorcycleForm.imageUrl')}
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />
      <div className={styles.actions}>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('common.saving') : (submitLabel ?? t('common.save'))}
        </Button>
      </div>
    </form>
  );
}
