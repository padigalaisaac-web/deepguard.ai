import { api } from './api';
import { AnalysisDetail, AnalysisListResponse } from '../types';

export const analysisService = {
  uploadMedia: async (file: File): Promise<{ analysis_id: string; media_type: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/analysis/upload', formData);
  },

  runAnalysis: async (analysisId: string): Promise<AnalysisDetail> => {
    return api.post<AnalysisDetail>(`/analysis/${analysisId}/run`);
  },

  getAnalysis: async (analysisId: string): Promise<AnalysisDetail> => {
    return api.get<AnalysisDetail>(`/analysis/${analysisId}`);
  },

  listAnalyses: async (params: {
    media_type?: string;
    result?: string;
    search?: string;
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_order?: string;
  } = {}): Promise<AnalysisListResponse> => {
    const query = new URLSearchParams();
    if (params.media_type && params.media_type !== 'all') query.append('media_type', params.media_type);
    if (params.result && params.result !== 'all') query.append('result', params.result);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page.toString());
    if (params.page_size) query.append('page_size', params.page_size.toString());
    if (params.sort_by) query.append('sort_by', params.sort_by);
    if (params.sort_order) query.append('sort_order', params.sort_order);

    const queryString = query.toString();
    return api.get<AnalysisListResponse>(`/analysis${queryString ? `?${queryString}` : ''}`);
  },

  deleteAnalysis: async (analysisId: string): Promise<{ message: string }> => {
    return api.delete(`/analysis/${analysisId}`);
  },

  downloadReport: async (analysisId: string, filename: string): Promise<void> => {
    const blob = await api.get<Blob>(`/analysis/${analysisId}/report`);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `DeepGuard_Report_${analysisId.slice(0, 8)}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
