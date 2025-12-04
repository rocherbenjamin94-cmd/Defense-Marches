import { api } from './api';
import type { DC1FormData, DC2FormData } from '@/lib/dc1/types';

export async function generatePdf(formData: DC1FormData): Promise<Blob> {
  const response = await api.post('/api/pdf/generate', { formData }, {
    responseType: 'blob',
  });
  return response.data;
}

export async function previewPdf(formData: DC1FormData): Promise<string> {
  const response = await api.post('/api/pdf/preview', { formData });
  return response.data;
}

export async function generateDC2Pdf(formData: DC2FormData): Promise<Blob> {
  const response = await api.post('/api/pdf/generate-dc2', { formData }, {
    responseType: 'blob',
  });
  return response.data;
}

export async function previewDC2Pdf(formData: DC2FormData): Promise<string> {
  const response = await api.post('/api/pdf/preview-dc2', { formData });
  return response.data;
}

export function downloadPdf(blob: Blob, filename: string = 'DC1-Candidature.pdf'): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
