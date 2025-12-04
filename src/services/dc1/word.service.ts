import { api } from './api';
import type { DC1FormData, DC2FormData } from '@/lib/dc1/types';

export async function generateWord(formData: DC1FormData): Promise<Blob> {
  const response = await api.post('/api/word/generate', { formData }, {
    responseType: 'blob',
  });
  return response.data;
}

export async function generateDC2Word(formData: DC2FormData): Promise<Blob> {
  const response = await api.post('/api/word/generate-dc2', { formData }, {
    responseType: 'blob',
  });
  return response.data;
}

export function downloadWord(blob: Blob, filename: string = 'DC1-Candidature.docx'): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
