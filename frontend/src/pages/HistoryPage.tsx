import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analysisService } from '../services/analysisService';
import { AnalysisListItem } from '../types';
import { ResultBadge } from '../components/common/ResultBadge';
import { RiskBadge } from '../components/common/RiskBadge';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  Image as ImageIcon,
  Film,
  Volume2,
  FileText,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [items, setItems] = useState<AnalysisListItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string>('all');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAnalyses = async () => {
    setIsLoading(true);
    try {
      const data = await analysisService.listAnalyses({
        media_type: mediaTypeFilter,
        result: resultFilter,
        search: searchQuery,
        page,
        page_size: pageSize,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error('Error fetching analyses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, [page, mediaTypeFilter, resultFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAnalyses();
  };

  const handleDelete = async (id: string, filename: string) => {
    if (confirm(`Permanently delete analysis for "${filename}"?`)) {
      try {
        await analysisService.deleteAnalysis(id);
        fetchAnalyses();
      } catch (err: any) {
        alert(`Delete failed: ${err.message}`);
      }
    }
  };

  const handleDownloadReport = async (id: string, filename: string) => {
    try {
      await analysisService.downloadReport(id, `DeepGuard_Report_${id.slice(0, 8)}.pdf`);
    } catch (err: any) {
      alert(`Report download failed: ${err.message}`);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100">Analysis History</h1>
          <p className="text-xs text-slate-400">
            Query, filter, and export formal forensic audit records across inspected media files.
          </p>
        </div>

        <Link
          to="/analyze"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 hover:from-cyan-400 hover:to-sky-400 transition shadow-lg shadow-cyan-500/20"
        >
          <UploadCloud className="w-4 h-4" />
          <span>New Analysis</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by filename or ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-slate-200 outline-none transition"
          />
        </form>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Media Type Filter */}
          <select
            value={mediaTypeFilter}
            onChange={(e) => {
              setMediaTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 outline-none focus:border-cyan-500"
          >
            <option value="all">All Media Types</option>
            <option value="image">Images Only</option>
            <option value="video">Videos Only</option>
            <option value="audio">Audio Only</option>
          </select>

          {/* Result Filter */}
          <select
            value={resultFilter}
            onChange={(e) => {
              setResultFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 outline-none focus:border-cyan-500"
          >
            <option value="all">All Verdicts</option>
            <option value="AUTHENTIC">Authentic Only</option>
            <option value="LIKELY_DEEPFAKE">Deepfakes Only</option>
            <option value="SUSPICIOUS">Suspicious Only</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}_${sortOrder}`}
            onChange={(e) => {
              const [col, ord] = e.target.value.split('_');
              setSortBy(col);
              setSortOrder(ord);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 outline-none focus:border-cyan-500"
          >
            <option value="created_at_desc">Newest First</option>
            <option value="created_at_asc">Oldest First</option>
            <option value="confidence_desc">Highest Confidence</option>
            <option value="confidence_asc">Lowest Confidence</option>
          </select>

          <button
            onClick={fetchAnalyses}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:text-cyan-400 text-slate-400 transition"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin mx-auto" />
            <span className="text-xs text-slate-400 font-mono">Querying forensic records...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-300">No matching analyses found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms or filter settings, or analyze a new media file.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px] bg-slate-950/40">
                  <th className="py-3.5 pl-6">Evidence Filename</th>
                  <th className="py-3.5">Modality</th>
                  <th className="py-3.5">Verdict</th>
                  <th className="py-3.5">Confidence</th>
                  <th className="py-3.5">Risk Rating</th>
                  <th className="py-3.5">Date Examined</th>
                  <th className="py-3.5 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition group">
                    <td className="py-4 pl-6 font-medium text-slate-200">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                          {item.media_type === 'image' && <ImageIcon className="w-4 h-4 text-cyan-400" />}
                          {item.media_type === 'video' && <Film className="w-4 h-4 text-sky-400" />}
                          {item.media_type === 'audio' && <Volume2 className="w-4 h-4 text-purple-400" />}
                        </div>
                        <div>
                          <span className="truncate max-w-[220px] sm:max-w-xs block font-semibold">
                            {item.original_filename}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            ID: {item.id.slice(0, 8)}... • {(item.file_size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 font-mono uppercase text-[11px] text-slate-400">{item.media_type}</td>

                    <td className="py-4">
                      <ResultBadge result={item.result} size="sm" />
                    </td>

                    <td className="py-4 font-mono font-bold text-slate-200">
                      {item.confidence ? `${item.confidence.toFixed(1)}%` : '—'}
                    </td>

                    <td className="py-4">
                      <RiskBadge level={item.risk_level} />
                    </td>

                    <td className="py-4 text-slate-400 text-[11px]">
                      {new Date(item.created_at).toLocaleString()}
                    </td>

                    <td className="py-4 text-right pr-6 space-x-1">
                      <Link
                        to={`/analysis/${item.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-cyan-400 text-[11px] font-semibold transition"
                        title="View Detailed Result"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">View</span>
                      </Link>

                      <button
                        onClick={() => handleDownloadReport(item.id, item.original_filename)}
                        className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:text-sky-400 text-slate-400 transition"
                        title="Download Forensic PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(item.id, item.original_filename)}
                        className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:text-rose-400 text-slate-400 transition"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} records
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-30 hover:bg-slate-800 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-slate-200">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-30 hover:bg-slate-800 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
