import { forwardRef } from 'react';
import type { TextInputProps } from './type/text-input.type';
import styles from './TextInput.module.css';

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className={styles.wrapper}>
        {label && <label className={styles.label}>{label}</label>}
        <input
          ref={ref}
          className={`${styles.input} ${error ? styles.inputError : ''} ${className || ''}`}
          {...props}
        />
        {error && <span className={styles.error}>{error}</span>}
      </div>
    );
  },
);

TextInput.displayName = 'TextInput';
