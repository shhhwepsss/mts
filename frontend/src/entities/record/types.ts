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
