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
  completeTask: (motorcycleId: string, taskId: string) =>
    `/motorcycles/${motorcycleId}/tasks/${taskId}/complete`,
  records: (motorcycleId: string) => `/motorcycles/${motorcycleId}/records`,
  record: (motorcycleId: string, recordId: string) =>
    `/motorcycles/${motorcycleId}/records/${recordId}`,
} as const;
