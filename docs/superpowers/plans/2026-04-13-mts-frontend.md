# MTS Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Vite + React web app with Feature-Sliced Design for motorcycle maintenance tracking.

**Architecture:** Responsive SPA using FSD layers (app, pages, widgets, features, entities, shared). CSS Modules for scoped styling with dark theme. react-router-dom for routing, @tanstack/react-query for data fetching, axios for HTTP.

**Tech Stack:** Vite, React 18, TypeScript, CSS Modules, react-router-dom v6, @tanstack/react-query v5, axios, @react-oauth/google, vitest, @testing-library/react

---

## Task 1: Project Scaffolding

**Files:**
- Create: `frontend/` (Vite project)
- Create: `frontend/src/` FSD folder structure

- [ ] **Step 1: Create Vite project**

```bash
cd /home/user/projects/mts
yarn create vite frontend --template react-ts
```

- [ ] **Step 2: Install dependencies**

```bash
cd /home/user/projects/mts/frontend
yarn add react-router-dom @tanstack/react-query axios @react-oauth/google
yarn add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @types/react @types/react-dom
```

- [ ] **Step 3: Create FSD folder structure**

```bash
cd /home/user/projects/mts/frontend/src
mkdir -p app/providers app/router app/styles
mkdir -p pages/login pages/garage pages/motorcycle-detail pages/add-motorcycle pages/edit-motorcycle pages/task-detail pages/complete-task pages/records-history pages/record-detail pages/edit-record pages/profile
mkdir -p widgets/motorcycle-card widgets/task-list widgets/record-list widgets/header
mkdir -p features/google-login features/log-hours features/create-motorcycle features/edit-motorcycle features/delete-motorcycle features/create-task features/edit-task features/delete-task features/complete-task features/edit-record features/delete-record
mkdir -p entities/motorcycle entities/task entities/record entities/user
mkdir -p shared/ui shared/api shared/lib shared/config
```

- [ ] **Step 4: Configure vitest in vite.config.ts**

```typescript
// frontend/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    css: true,
  },
});
```

- [ ] **Step 5: Create test setup file**

```typescript
// frontend/src/test-setup.ts
import '@testing-library/jest-dom';
```

- [ ] **Step 6: Verify it runs**

Run: `cd /home/user/projects/mts/frontend && yarn dev`
Expected: Vite dev server starts on http://localhost:5173

- [ ] **Step 7: Commit**

```bash
git add frontend/
git commit -m "feat(frontend): scaffold Vite + React project with FSD structure"
```

---

## Task 2: Shared — Design Tokens & Global Styles

**Files:**
- Create: `frontend/src/app/styles/variables.css`
- Create: `frontend/src/app/styles/reset.css`
- Create: `frontend/src/app/styles/global.css`

- [ ] **Step 1: Create CSS variables**

```css
/* frontend/src/app/styles/variables.css */
:root {
  --bg-primary: #0d0d1a;
  --bg-secondary: #1a1a2e;
  --bg-tertiary: #2a2a3e;
  --text-primary: #e0e0e0;
  --text-secondary: #888888;
  --text-input: #ffffff;
  --border: #333333;
  --accent: #90caf9;
  --status-ok: #4caf50;
  --status-due-soon: #ff9800;
  --status-overdue: #f44336;
  --action-primary: #2e7d32;
  --action-primary-hover: #388e3c;
  --action-danger: #c62828;
  --action-danger-hover: #d32f2f;
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  --radius: 8px;
  --radius-sm: 4px;
}
```

- [ ] **Step 2: Create CSS reset**

```css
/* frontend/src/app/styles/reset.css */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-family);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

a {
  color: var(--accent);
  text-decoration: none;
}

button {
  cursor: pointer;
  font-family: inherit;
}

input, textarea, select {
  font-family: inherit;
  color: var(--text-input);
}
```

- [ ] **Step 3: Create global.css that imports both**

```css
/* frontend/src/app/styles/global.css */
@import './variables.css';
@import './reset.css';
```

- [ ] **Step 4: Import in main entry**

```typescript
// frontend/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './app/styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div>MTS App</div>
  </React.StrictMode>,
);
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/styles/ frontend/src/main.tsx
git commit -m "feat(frontend): add design tokens, CSS reset, global styles"
```

---

## Task 3: Shared — UI Kit

**Files:**
- Create: `frontend/src/shared/ui/Button/Button.tsx`
- Create: `frontend/src/shared/ui/Button/Button.module.css`
- Create: `frontend/src/shared/ui/TextInput/TextInput.tsx`
- Create: `frontend/src/shared/ui/TextInput/TextInput.module.css`
- Create: `frontend/src/shared/ui/Card/Card.tsx`
- Create: `frontend/src/shared/ui/Card/Card.module.css`
- Create: `frontend/src/shared/ui/StatusBadge/StatusBadge.tsx`
- Create: `frontend/src/shared/ui/StatusBadge/StatusBadge.module.css`
- Create: `frontend/src/shared/ui/Modal/Modal.tsx`
- Create: `frontend/src/shared/ui/Modal/Modal.module.css`
- Create: `frontend/src/shared/ui/Spinner/Spinner.tsx`
- Create: `frontend/src/shared/ui/EmptyState/EmptyState.tsx`
- Create: `frontend/src/shared/ui/index.ts`
- Test: `frontend/src/shared/ui/Button/Button.test.tsx`

- [ ] **Step 1: Write Button test**

```typescript
// frontend/src/shared/ui/Button/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await userEvent.click(screen.getByText('Click'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('applies variant class', () => {
    render(<Button variant="danger">Delete</Button>);
    const btn = screen.getByText('Delete');
    expect(btn.className).toContain('danger');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/user/projects/mts/frontend && npx vitest run src/shared/ui/Button/Button.test.tsx --reporter=verbose`
Expected: FAIL — Cannot find module './Button'

- [ ] **Step 3: Implement Button**

```typescript
// frontend/src/shared/ui/Button/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'danger';
  children: ReactNode;
}

export function Button({ variant = 'primary', children, className, ...props }: ButtonProps) {
  return (
    <button className={`${styles.button} ${styles[variant]} ${className || ''}`} {...props}>
      {children}
    </button>
  );
}
```

```css
/* frontend/src/shared/ui/Button/Button.module.css */
.button {
  padding: 10px 20px;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 600;
  border: 1px solid transparent;
  transition: background-color 0.2s, border-color 0.2s;
}

.primary {
  background-color: var(--action-primary);
  color: #ffffff;
  border-color: var(--action-primary);
}

.primary:hover {
  background-color: var(--action-primary-hover);
}

.outline {
  background-color: transparent;
  color: var(--text-primary);
  border-color: var(--border);
}

.outline:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.danger {
  background-color: transparent;
  color: var(--action-danger);
  border-color: var(--action-danger);
}

.danger:hover {
  background-color: var(--action-danger);
  color: #ffffff;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/user/projects/mts/frontend && npx vitest run src/shared/ui/Button/Button.test.tsx --reporter=verbose`
Expected: PASS — 3 tests

- [ ] **Step 5: Create TextInput**

```typescript
// frontend/src/shared/ui/TextInput/TextInput.tsx
import { InputHTMLAttributes, forwardRef } from 'react';
import styles from './TextInput.module.css';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className={styles.wrapper}>
        {label && <label className={styles.label}>{label}</label>}
        <input ref={ref} className={`${styles.input} ${error ? styles.inputError : ''} ${className || ''}`} {...props} />
        {error && <span className={styles.error}>{error}</span>}
      </div>
    );
  },
);

TextInput.displayName = 'TextInput';
```

```css
/* frontend/src/shared/ui/TextInput/TextInput.module.css */
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 12px;
  text-transform: uppercase;
  color: var(--text-secondary);
  letter-spacing: 0.5px;
}

.input {
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 12px;
  font-size: 14px;
  color: var(--text-input);
  outline: none;
  transition: border-color 0.2s;
}

.input::placeholder {
  color: var(--text-secondary);
}

.input:focus {
  border-color: var(--accent);
}

.inputError {
  border-color: var(--action-danger);
}

.error {
  font-size: 12px;
  color: var(--action-danger);
}
```

- [ ] **Step 6: Create Card**

```typescript
// frontend/src/shared/ui/Card/Card.tsx
import { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  borderColor?: string;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, borderColor, className, onClick }: CardProps) {
  return (
    <div
      className={`${styles.card} ${onClick ? styles.clickable : ''} ${className || ''}`}
      style={borderColor ? { borderLeftColor: borderColor } : undefined}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
```

```css
/* frontend/src/shared/ui/Card/Card.module.css */
.card {
  background-color: var(--bg-secondary);
  border-radius: var(--radius);
  padding: 16px;
  border-left: 3px solid transparent;
}

.clickable {
  cursor: pointer;
  transition: background-color 0.2s;
}

.clickable:hover {
  background-color: var(--bg-tertiary);
}
```

- [ ] **Step 7: Create StatusBadge**

```typescript
// frontend/src/shared/ui/StatusBadge/StatusBadge.tsx
import styles from './StatusBadge.module.css';

type Status = 'OK' | 'DUE_SOON' | 'OVERDUE';

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`${styles.badge} ${styles[status]}`}>●</span>;
}
```

```css
/* frontend/src/shared/ui/StatusBadge/StatusBadge.module.css */
.badge {
  font-size: 20px;
  line-height: 1;
}

.OK {
  color: var(--status-ok);
}

.DUE_SOON {
  color: var(--status-due-soon);
}

.OVERDUE {
  color: var(--status-overdue);
}
```

- [ ] **Step 8: Create Modal**

```typescript
// frontend/src/shared/ui/Modal/Modal.tsx
import { ReactNode, useEffect } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.close} onClick={onClose}>×</button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
```

```css
/* frontend/src/shared/ui/Modal/Modal.module.css */
.overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal {
  background-color: var(--bg-secondary);
  border-radius: var(--radius);
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.title {
  font-size: 18px;
  font-weight: 600;
}

.close {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 24px;
  padding: 4px;
}

.body {
  padding: 20px;
}

@media (max-width: 767px) {
  .modal {
    max-width: none;
    max-height: none;
    height: 100%;
    border-radius: 0;
  }
}
```

- [ ] **Step 9: Create Spinner and EmptyState**

```typescript
// frontend/src/shared/ui/Spinner/Spinner.tsx
import styles from './Spinner.module.css';

export function Spinner() {
  return <div className={styles.spinner} />;
}
```

```css
/* frontend/src/shared/ui/Spinner/Spinner.module.css */
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 24px auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

```typescript
// frontend/src/shared/ui/EmptyState/EmptyState.tsx
interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-secondary)' }}>
      <p>{message}</p>
    </div>
  );
}
```

- [ ] **Step 10: Create barrel export**

```typescript
// frontend/src/shared/ui/index.ts
export { Button } from './Button/Button';
export { TextInput } from './TextInput/TextInput';
export { Card } from './Card/Card';
export { StatusBadge } from './StatusBadge/StatusBadge';
export { Modal } from './Modal/Modal';
export { Spinner } from './Spinner/Spinner';
export { EmptyState } from './EmptyState/EmptyState';
```

- [ ] **Step 11: Commit**

```bash
git add frontend/src/shared/ui/
git commit -m "feat(frontend): add shared UI kit — Button, TextInput, Card, StatusBadge, Modal, Spinner, EmptyState"
```

---

## Task 4: Shared — API Client

**Files:**
- Create: `frontend/src/shared/api/client.ts`
- Create: `frontend/src/shared/api/tokens.ts`
- Create: `frontend/src/shared/api/index.ts`

- [ ] **Step 1: Create token management**

```typescript
// frontend/src/shared/api/tokens.ts
const ACCESS_TOKEN_KEY = 'mts_access_token';
const REFRESH_TOKEN_KEY = 'mts_refresh_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
```

- [ ] **Step 2: Create axios instance with interceptors**

```typescript
// frontend/src/shared/api/client.ts
import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './tokens';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          setTokens(data.accessToken, data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(originalRequest);
        } catch {
          clearTokens();
          window.location.href = '/login';
        }
      } else {
        clearTokens();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
```

- [ ] **Step 3: Barrel export**

```typescript
// frontend/src/shared/api/index.ts
export { apiClient } from './client';
export { getAccessToken, getRefreshToken, setTokens, clearTokens } from './tokens';
```

- [ ] **Step 4: Create .env**

```env
# frontend/.env
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/shared/api/ frontend/.env
git commit -m "feat(frontend): add API client with JWT interceptors and token management"
```

---

## Task 5: Shared — Lib

**Files:**
- Create: `frontend/src/shared/lib/format.ts`
- Create: `frontend/src/shared/lib/index.ts`
- Create: `frontend/src/shared/config/constants.ts`
- Test: `frontend/src/shared/lib/format.test.ts`

- [ ] **Step 1: Write format test**

```typescript
// frontend/src/shared/lib/format.test.ts
import { formatHours, formatDate, getStatusColor } from './format';

describe('format utils', () => {
  it('formatHours formats with h suffix', () => {
    expect(formatHours(142.5)).toBe('142.5h');
    expect(formatHours(0)).toBe('0h');
  });

  it('formatDate formats to readable date', () => {
    expect(formatDate(new Date('2026-04-13'))).toBe('Apr 13, 2026');
  });

  it('getStatusColor returns correct color', () => {
    expect(getStatusColor('OK')).toBe('var(--status-ok)');
    expect(getStatusColor('DUE_SOON')).toBe('var(--status-due-soon)');
    expect(getStatusColor('OVERDUE')).toBe('var(--status-overdue)');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/user/projects/mts/frontend && npx vitest run src/shared/lib/format.test.ts --reporter=verbose`
Expected: FAIL

- [ ] **Step 3: Implement format utils**

```typescript
// frontend/src/shared/lib/format.ts
export function formatHours(hours: number): string {
  return `${hours}h`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function getStatusColor(status: 'OK' | 'DUE_SOON' | 'OVERDUE'): string {
  const colors = {
    OK: 'var(--status-ok)',
    DUE_SOON: 'var(--status-due-soon)',
    OVERDUE: 'var(--status-overdue)',
  };
  return colors[status];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/user/projects/mts/frontend && npx vitest run src/shared/lib/format.test.ts --reporter=verbose`
Expected: PASS — 3 tests

- [ ] **Step 5: Create constants**

```typescript
// frontend/src/shared/config/constants.ts
export const DUE_SOON_THRESHOLD = 2;

export const API_ROUTES = {
  AUTH_GOOGLE: '/auth/google',
  AUTH_REFRESH: '/auth/refresh',
  USERS_ME: '/users/me',
  MOTORCYCLES: '/motorcycles',
  motorcycle: (id: string) => `/motorcycles/${id}`,
  motorcycleHours: (id: string) => `/motorcycles/${id}/hours`,
  tasks: (motorcycleId: string) => `/motorcycles/${motorcycleId}/tasks`,
  task: (motorcycleId: string, taskId: string) => `/motorcycles/${motorcycleId}/tasks/${taskId}`,
  completeTask: (motorcycleId: string, taskId: string) => `/motorcycles/${motorcycleId}/tasks/${taskId}/complete`,
  records: (motorcycleId: string) => `/motorcycles/${motorcycleId}/records`,
  record: (motorcycleId: string, recordId: string) => `/motorcycles/${motorcycleId}/records/${recordId}`,
} as const;
```

- [ ] **Step 6: Barrel exports**

```typescript
// frontend/src/shared/lib/index.ts
export { formatHours, formatDate, getStatusColor } from './format';
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/shared/lib/ frontend/src/shared/config/
git commit -m "feat(frontend): add format utils and API route constants"
```

---

## Task 6: Entities — Types & API

**Files:**
- Create: `frontend/src/entities/user/types.ts`
- Create: `frontend/src/entities/user/api.ts`
- Create: `frontend/src/entities/user/index.ts`
- Create: `frontend/src/entities/motorcycle/types.ts`
- Create: `frontend/src/entities/motorcycle/api.ts`
- Create: `frontend/src/entities/motorcycle/index.ts`
- Create: `frontend/src/entities/task/types.ts`
- Create: `frontend/src/entities/task/api.ts`
- Create: `frontend/src/entities/task/index.ts`
- Create: `frontend/src/entities/record/types.ts`
- Create: `frontend/src/entities/record/api.ts`
- Create: `frontend/src/entities/record/index.ts`

- [ ] **Step 1: Create User entity**

```typescript
// frontend/src/entities/user/types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}
```

```typescript
// frontend/src/entities/user/api.ts
import { apiClient } from '@/shared/api';
import { API_ROUTES } from '@/shared/config/constants';
import { User } from './types';

export const userApi = {
  getProfile: () => apiClient.get<User>(API_ROUTES.USERS_ME).then((r) => r.data),
  updateProfile: (name: string) => apiClient.patch<User>(API_ROUTES.USERS_ME, { name }).then((r) => r.data),
};
```

```typescript
// frontend/src/entities/user/index.ts
export type { User } from './types';
export { userApi } from './api';
```

- [ ] **Step 2: Create Motorcycle entity**

```typescript
// frontend/src/entities/motorcycle/types.ts
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
```

```typescript
// frontend/src/entities/motorcycle/api.ts
import { apiClient } from '@/shared/api';
import { API_ROUTES } from '@/shared/config/constants';
import { Motorcycle, CreateMotorcycleParams, UpdateMotorcycleParams } from './types';

export const motorcycleApi = {
  list: () => apiClient.get<Motorcycle[]>(API_ROUTES.MOTORCYCLES).then((r) => r.data),
  getById: (id: string) => apiClient.get<Motorcycle>(API_ROUTES.motorcycle(id)).then((r) => r.data),
  create: (params: CreateMotorcycleParams) => apiClient.post<Motorcycle>(API_ROUTES.MOTORCYCLES, params).then((r) => r.data),
  update: (id: string, params: UpdateMotorcycleParams) => apiClient.patch<Motorcycle>(API_ROUTES.motorcycle(id), params).then((r) => r.data),
  updateHours: (id: string, currentHours: number) => apiClient.patch(API_ROUTES.motorcycleHours(id), { currentHours }).then((r) => r.data),
  delete: (id: string) => apiClient.delete(API_ROUTES.motorcycle(id)),
};
```

```typescript
// frontend/src/entities/motorcycle/index.ts
export type { Motorcycle, MotorcycleType, CreateMotorcycleParams, UpdateMotorcycleParams } from './types';
export { motorcycleApi } from './api';
```

- [ ] **Step 3: Create Task entity**

```typescript
// frontend/src/entities/task/types.ts
export type TaskStatus = 'OK' | 'DUE_SOON' | 'OVERDUE';

export interface Task {
  id: string;
  name: string;
  description: string | null;
  intervalHours: number;
  lastServicedAtHours: number | null;
  isDefault: boolean;
  isActive: boolean;
  status: TaskStatus;
  hoursRemaining: number;
}

export interface CreateTaskParams {
  name: string;
  description?: string;
  intervalHours: number;
}

export interface UpdateTaskParams {
  name?: string;
  description?: string;
  intervalHours?: number;
  isActive?: boolean;
}

export interface CompleteTaskParams {
  performedAtHours: number;
  performedAtDate: string;
  notes?: string;
  photos?: string[];
}
```

```typescript
// frontend/src/entities/task/api.ts
import { apiClient } from '@/shared/api';
import { API_ROUTES } from '@/shared/config/constants';
import { Task, CreateTaskParams, UpdateTaskParams, CompleteTaskParams } from './types';

export const taskApi = {
  listByMotorcycle: (motorcycleId: string) => apiClient.get<Task[]>(API_ROUTES.tasks(motorcycleId)).then((r) => r.data),
  create: (motorcycleId: string, params: CreateTaskParams) => apiClient.post(API_ROUTES.tasks(motorcycleId), params).then((r) => r.data),
  update: (motorcycleId: string, taskId: string, params: UpdateTaskParams) => apiClient.patch(API_ROUTES.task(motorcycleId, taskId), params).then((r) => r.data),
  complete: (motorcycleId: string, taskId: string, params: CompleteTaskParams) => apiClient.post(API_ROUTES.completeTask(motorcycleId, taskId), params).then((r) => r.data),
  delete: (motorcycleId: string, taskId: string) => apiClient.delete(API_ROUTES.task(motorcycleId, taskId)),
};
```

```typescript
// frontend/src/entities/task/index.ts
export type { Task, TaskStatus, CreateTaskParams, UpdateTaskParams, CompleteTaskParams } from './types';
export { taskApi } from './api';
```

- [ ] **Step 4: Create Record entity**

```typescript
// frontend/src/entities/record/types.ts
export interface MaintenanceRecord {
  id: string;
  taskId: string;
  performedAtHours: number;
  performedAtDate: string;
  notes: string | null;
  photos: string[];
}

export interface RecordListResponse {
  records: MaintenanceRecord[];
  total: number;
  page: number;
  limit: number;
}

export interface EditRecordParams {
  performedAtHours?: number;
  performedAtDate?: string;
  notes?: string;
  photos?: string[];
}
```

```typescript
// frontend/src/entities/record/api.ts
import { apiClient } from '@/shared/api';
import { API_ROUTES } from '@/shared/config/constants';
import { MaintenanceRecord, RecordListResponse, EditRecordParams } from './types';

export const recordApi = {
  list: (motorcycleId: string, taskId?: string, page = 1, limit = 20) => {
    const params: any = { page, limit };
    if (taskId) params.taskId = taskId;
    return apiClient.get<RecordListResponse>(API_ROUTES.records(motorcycleId), { params }).then((r) => r.data);
  },
  getById: (motorcycleId: string, recordId: string) => apiClient.get<MaintenanceRecord>(API_ROUTES.record(motorcycleId, recordId)).then((r) => r.data),
  edit: (motorcycleId: string, recordId: string, params: EditRecordParams) => apiClient.patch<MaintenanceRecord>(API_ROUTES.record(motorcycleId, recordId), params).then((r) => r.data),
  delete: (motorcycleId: string, recordId: string) => apiClient.delete(API_ROUTES.record(motorcycleId, recordId)),
};
```

```typescript
// frontend/src/entities/record/index.ts
export type { MaintenanceRecord, RecordListResponse, EditRecordParams } from './types';
export { recordApi } from './api';
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/entities/
git commit -m "feat(frontend): add entity types and API modules — user, motorcycle, task, record"
```

---

## Task 7: App — Auth Provider

**Files:**
- Create: `frontend/src/app/providers/AuthProvider.tsx`

- [ ] **Step 1: Create AuthProvider**

```typescript
// frontend/src/app/providers/AuthProvider.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, userApi } from '@/entities/user';
import { getAccessToken, clearTokens, setTokens } from '@/shared/api';
import { apiClient } from '@/shared/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (googleToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      userApi
        .getProfile()
        .then(setUser)
        .catch(() => clearTokens())
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (googleToken: string) => {
    const { data } = await apiClient.post('/auth/google', { token: googleToken });
    setTokens(data.accessToken, data.refreshToken);
    const profile = await userApi.getProfile();
    setUser(profile);
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/providers/
git commit -m "feat(frontend): add AuthProvider with Google login and token management"
```

---

## Task 8: App — Router

**Files:**
- Create: `frontend/src/app/router/routes.tsx`
- Create: `frontend/src/app/router/ProtectedRoute.tsx`
- Create: `frontend/src/app/router/index.ts`

- [ ] **Step 1: Create ProtectedRoute**

```typescript
// frontend/src/app/router/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { Spinner } from '@/shared/ui';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
```

- [ ] **Step 2: Create routes**

```typescript
// frontend/src/app/router/routes.tsx
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Lazy load pages
import { LoginPage } from '@/pages/login';
import { GaragePage } from '@/pages/garage';
import { MotorcycleDetailPage } from '@/pages/motorcycle-detail';
import { AddMotorcyclePage } from '@/pages/add-motorcycle';
import { EditMotorcyclePage } from '@/pages/edit-motorcycle';
import { TaskDetailPage } from '@/pages/task-detail';
import { CompleteTaskPage } from '@/pages/complete-task';
import { RecordsHistoryPage } from '@/pages/records-history';
import { RecordDetailPage } from '@/pages/record-detail';
import { EditRecordPage } from '@/pages/edit-record';
import { ProfilePage } from '@/pages/profile';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <ProtectedRoute><GaragePage /></ProtectedRoute>,
  },
  {
    path: '/garage',
    element: <ProtectedRoute><GaragePage /></ProtectedRoute>,
  },
  {
    path: '/garage/add',
    element: <ProtectedRoute><AddMotorcyclePage /></ProtectedRoute>,
  },
  {
    path: '/garage/:id',
    element: <ProtectedRoute><MotorcycleDetailPage /></ProtectedRoute>,
  },
  {
    path: '/garage/:id/edit',
    element: <ProtectedRoute><EditMotorcyclePage /></ProtectedRoute>,
  },
  {
    path: '/garage/:id/tasks/:taskId',
    element: <ProtectedRoute><TaskDetailPage /></ProtectedRoute>,
  },
  {
    path: '/garage/:id/tasks/:taskId/complete',
    element: <ProtectedRoute><CompleteTaskPage /></ProtectedRoute>,
  },
  {
    path: '/garage/:id/records',
    element: <ProtectedRoute><RecordsHistoryPage /></ProtectedRoute>,
  },
  {
    path: '/garage/:id/records/:recordId',
    element: <ProtectedRoute><RecordDetailPage /></ProtectedRoute>,
  },
  {
    path: '/garage/:id/records/:recordId/edit',
    element: <ProtectedRoute><EditRecordPage /></ProtectedRoute>,
  },
  {
    path: '/profile',
    element: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
  },
]);
```

Note: The page imports will fail until we create stub pages. Create them as stubs in the next step.

- [ ] **Step 3: Create stub pages** (each exports a simple component)

Create each page as a minimal stub. Example for each:

```typescript
// frontend/src/pages/login/index.tsx
export function LoginPage() {
  return <div>Login Page</div>;
}

// frontend/src/pages/garage/index.tsx
export function GaragePage() {
  return <div>Garage Page</div>;
}

// (repeat for all pages — motorcycle-detail, add-motorcycle, edit-motorcycle,
//  task-detail, complete-task, records-history, record-detail, edit-record, profile)
```

Create an `index.tsx` in each page folder exporting a named component with placeholder text.

- [ ] **Step 4: Wire everything in main.tsx**

```typescript
// frontend/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './app/providers/AuthProvider';
import { router } from './app/router/routes';
import './app/styles/global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
  },
});

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
```

- [ ] **Step 5: Verify routing works**

Run: `cd /home/user/projects/mts/frontend && yarn dev`
Expected: App starts, navigating to /login shows "Login Page", other routes redirect to /login

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/router/ frontend/src/pages/ frontend/src/main.tsx
git commit -m "feat(frontend): add router with protected routes and stub pages"
```

---

## Remaining Tasks (9-17) — Summary

Tasks 9-17 follow the same pattern as above. Each implements a specific widget, feature, or page. The structure is consistent:

### Task 9: Widgets — Header
Create top navbar with MTS logo, breadcrumbs, user avatar, hamburger on mobile.

### Task 10: Features — Google Login
GoogleLoginButton using @react-oauth/google, calls auth context login().

### Task 11: Pages — Login
Centered card with logo and GoogleLoginButton.

### Task 12: Widgets — Motorcycle Card
Card component with name, brand/model, year, type, hours, overdue count, colored border.

### Task 13: Pages — Garage
Grid of motorcycle cards using react-query, add button, empty state.

### Task 14: Features — Create/Edit Motorcycle
Form component with validation, reusable for both create and edit.

### Task 15: Pages — Add/Edit Motorcycle
Pages wrapping the motorcycle form feature.

### Task 16: Features — Log Hours, Complete Task
Modal forms for logging hours and completing tasks.

### Task 17: Widgets — Task List, Record List + Remaining Pages
Task table/cards, record table, and all remaining page implementations (motorcycle-detail, task-detail, complete-task, records-history, record-detail, edit-record, profile).

Each task follows the same TDD pattern: write test → verify fail → implement → verify pass → commit.

---

**Note:** Tasks 9-17 are deliberately summarized because they follow identical patterns to Tasks 1-8. The implementation details (exact code, components, CSS modules) follow the same conventions established above. An implementing agent should expand each task into full steps using the established patterns: CSS Modules for styling, react-query for data fetching, the entity API modules for HTTP calls, and the shared UI kit for components.
