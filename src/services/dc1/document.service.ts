import { api } from './api';
import type { AnalyzeDocumentResponse, DocumentHistoryItem } from '@/lib/dc1/types';

export async function analyzeDocument(file: File): Promise<AnalyzeDocumentResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<AnalyzeDocumentResponse>(
    '/api/document/analyze',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutes for OCR processing
    }
  );
  return response.data;
}

export async function getDocumentHistory(limit = 20): Promise<{
  success: boolean;
  data: DocumentHistoryItem[];
  message: string;
}> {
  const response = await api.get(`/api/document/history?limit=${limit}`);
  return response.data;
}
