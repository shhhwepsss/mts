import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { FileStoragePort } from './file-storage.port';

@Injectable()
export class LocalFileStorageAdapter implements FileStoragePort {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  async upload(file: Buffer, filename: string): Promise<string> {
    await fs.mkdir(this.uploadDir, { recursive: true });
    const filepath = path.join(this.uploadDir, filename);
    await fs.writeFile(filepath, file);
    return filename;
  }

  getUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  async delete(filename: string): Promise<void> {
    const filepath = path.join(this.uploadDir, filename);
    await fs.unlink(filepath).catch(() => {});
  }
}
