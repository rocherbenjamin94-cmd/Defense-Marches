import { useState, useCallback } from 'react';
import { analyzeDocument } from '@/services/dc1/document.service';
import type { ExtractedDocumentData } from '@/lib/dc1/types';

interface UseDocumentAnalysisResult {
  analyze: (file: File) => Promise<void>;
  data: ExtractedDocumentData | null;
  documentId: number | null;
  isAnalyzing: boolean;
  error: string | null;
  reset: () => void;
}

export function useDocumentAnalysis(): UseDocumentAnalysisResult {
  const [data, setData] = useState<ExtractedDocumentData | null>(null);
  const [documentId, setDocumentId] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    setData(null);
    setDocumentId(null);

    try {
      const response = await analyzeDocument(file);

      if (response.success) {
        setData(response.data);
        setDocumentId(response.documentId ?? null);
      } else {
        setError(response.message || "Erreur lors de l'analyse");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'analyse du document";
      setError(message);
      setData(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setDocumentId(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  return { analyze, data, documentId, isAnalyzing, error, reset };
}
