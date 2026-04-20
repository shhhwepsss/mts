import type { ButtonProps } from './type/button.type';
import styles from './Button.module.css';

export function Button({ variant = 'primary', children, className, ...props }: ButtonProps) {
  return (
    <button className={`${styles.button} ${styles[variant]} ${className || ''}`} {...props}>
      {children}
    </button>
  );
}
