export const FILE_STORAGE = Symbol('FILE_STORAGE');

export interface FileStoragePort {
  upload(file: Buffer, filename: string): Promise<string>;
  getUrl(filename: string): string;
  delete(filename: string): Promise<void>;
}
