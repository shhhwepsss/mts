import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

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
    element: (
      <ProtectedRoute>
        <GaragePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/garage',
    element: (
      <ProtectedRoute>
        <GaragePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/garage/add',
    element: (
      <ProtectedRoute>
        <AddMotorcyclePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/garage/:id',
    element: (
      <ProtectedRoute>
        <MotorcycleDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/garage/:id/edit',
    element: (
      <ProtectedRoute>
        <EditMotorcyclePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/garage/:id/tasks/:taskId',
    element: (
      <ProtectedRoute>
        <TaskDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/garage/:id/tasks/:taskId/complete',
    element: (
      <ProtectedRoute>
        <CompleteTaskPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/garage/:id/records',
    element: (
      <ProtectedRoute>
        <RecordsHistoryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/garage/:id/records/:recordId',
    element: (
      <ProtectedRoute>
        <RecordDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/garage/:id/records/:recordId/edit',
    element: (
      <ProtectedRoute>
        <EditRecordPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
]);
