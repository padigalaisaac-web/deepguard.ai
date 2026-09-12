import { api } from './api';
import {
  AnalysisDetail,
  AnalysisListResponse,
} from '../types';

type UploadResponse = {
  analysis_id: string;
  media_type: string;
  filename: string;
};

export const analysisService = {
  // Upload image or video
  uploadMedia: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<any>(
      '/analysis/upload',
      formData
    );

    console.log('Upload API response:', response);

    const analysisId =
      response?.analysis_id ||
      response?.id ||
      response?.data?.analysis_id ||
      response?.data?.id;

    if (!analysisId) {
      throw new Error(
        'Upload succeeded, but the backend did not return an analysis ID.'
      );
    }

    return {
      analysis_id: analysisId,

      media_type:
        response?.media_type ||
        response?.data?.media_type ||
        file.type,

      filename:
        response?.filename ||
        response?.data?.filename ||
        file.name,
    };
  },

  // Run analysis
  runAnalysis: async (
    analysisId: string
  ): Promise<AnalysisDetail> => {
    return api.post<AnalysisDetail>(
      `/analysis/${analysisId}/run`
    );
  },

  // Get one analysis result
  getAnalysis: async (
    analysisId: string
  ): Promise<AnalysisDetail> => {
    return api.get<AnalysisDetail>(
      `/analysis/${analysisId}`
    );
  },

  // Get analysis history
  listAnalyses: async (
    params: {
      media_type?: string;
      result?: string;
      search?: string;
      page?: number;
      page_size?: number;
      sort_by?: string;
      sort_order?: string;
    } = {}
  ): Promise<AnalysisListResponse> => {
    const query = new URLSearchParams();

    if (
      params.media_type &&
      params.media_type !== 'all'
    ) {
      query.append(
        'media_type',
        params.media_type
      );
    }

    if (
      params.result &&
      params.result !== 'all'
    ) {
      query.append(
        'result',
        params.result
      );
    }

    if (params.search) {
      query.append(
        'search',
        params.search
      );
    }

    if (params.page) {
      query.append(
        'page',
        params.page.toString()
      );
    }

    if (params.page_size) {
      query.append(
        'page_size',
        params.page_size.toString()
      );
    }

    if (params.sort_by) {
      query.append(
        'sort_by',
        params.sort_by
      );
    }

    if (params.sort_order) {
      query.append(
        'sort_order',
        params.sort_order
      );
    }

    const queryString = query.toString();

    return api.get<AnalysisListResponse>(
      `/analysis${
        queryString ? `?${queryString}` : ''
      }`
    );
  },

  // Delete analysis
  deleteAnalysis: async (
    analysisId: string
  ): Promise<{ message: string }> => {
    return api.delete(
      `/analysis/${analysisId}`
    );
  },

  // Download analysis report
  downloadReport: async (
    analysisId: string,
    filename: string
  ): Promise<void> => {
    const blob = await api.get<Blob>(
      `/analysis/${analysisId}/report`
    );

    const url =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;

    link.download =
      filename ||
      `DeepGuard_Report_${analysisId.slice(
        0,
        8
      )}.pdf`;

    document.body.appendChild(link);

    link.click();

    window.URL.revokeObjectURL(url);

    document.body.removeChild(link);
  },
};
