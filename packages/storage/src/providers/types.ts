import type { GetObjectUrlInput, GetUploadUrlInput } from "../lib/schema";

export interface StorageProviderStrategy {
  getUploadUrl: (data: GetUploadUrlInput) => Promise<{ url: string }>;
  getSignedUrl: (data: GetObjectUrlInput) => Promise<{ url: string }>;
  getPublicUrl: (data: GetObjectUrlInput) => Promise<{ url: string }>;
  getDeleteUrl: (data: GetObjectUrlInput) => Promise<{ url: string }>;
}
