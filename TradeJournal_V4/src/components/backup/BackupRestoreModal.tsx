import React, { useState } from 'react';
import {
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  FileJson,
  X,
  CheckCircle2,
  AlertCircle,
  Database,
  RefreshCw,
  FolderArchive,
  Code,
} from 'lucide-react';
import { useTrades } from '../../context/TradesContext';
import { downloadProjectZip } from '../../utils/downloadZip';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({ isOpen, onClose }) => {
  const { trades, exportToCSV, exportToExcel, backupAllTradesJSON, restoreTradesFromJSON } =
    useTrades();

  const [restoring, setRestoring] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<{
    success?: boolean;
    imported?: number;
    errors?: number;
    message?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoring(true);
    setRestoreStatus(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const res = await restoreTradesFromJSON(text);
        setRestoreStatus({
          success: true,
          imported: res.imported,
          errors: res.errors,
          message: `Successfully imported ${res.imported} trades into Firebase Firestore.${
            res.errors > 0 ? ` (${res.errors} invalid rows skipped)` : ''
          }`,
        });
      } catch (err: unknown) {
        setRestoreStatus({
          success: false,
          message: err instanceof Error ? err.message : 'Failed to parse and restore trades backup.',
        });
      } finally {
        setRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-[#0d121c] border border-white/[0.08] shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4 bg-[#0a0e17]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Data Backup & Export</h3>
              <p className="text-xs text-slate-400 font-mono-nums">{trades.length} trade records in journal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Export Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Export Trades
            </h4>
            <p className="text-xs text-slate-400">
              Download complete logs with dated filenames for tax accounting, spreadsheet analysis, or offline storage.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* CSV Export */}
              <button
                onClick={exportToCSV}
                disabled={trades.length === 0}
                className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-[#0a0e17] border border-white/[0.06] hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all disabled:opacity-40 cursor-pointer group"
              >
                <FileText className="w-6 h-6 text-emerald-400 mb-1.5 group-hover:scale-105 transition-transform" />
                <span className="text-xs font-bold text-white">CSV Export</span>
                <span className="text-[10px] text-slate-500 mt-0.5 font-mono-nums">TradeJournal_{todayStr}.csv</span>
              </button>

              {/* Excel Export */}
              <button
                onClick={exportToExcel}
                disabled={trades.length === 0}
                className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-[#0a0e17] border border-white/[0.06] hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all disabled:opacity-40 cursor-pointer group"
              >
                <FileSpreadsheet className="w-6 h-6 text-cyan-400 mb-1.5 group-hover:scale-105 transition-transform" />
                <span className="text-xs font-bold text-white">Excel (XLS)</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Formatted Table</span>
              </button>

              {/* Full JSON Backup */}
              <button
                onClick={backupAllTradesJSON}
                disabled={trades.length === 0}
                className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-[#0a0e17] border border-white/[0.06] hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all disabled:opacity-40 cursor-pointer group"
              >
                <FileJson className="w-6 h-6 text-indigo-400 mb-1.5 group-hover:scale-105 transition-transform" />
                <span className="text-xs font-bold text-white">JSON Archive</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Full Journal State</span>
              </button>
            </div>
          </div>

          {/* Project Source Codebase Export */}
          <div className="space-y-3 pt-5 border-t border-white/[0.06]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FolderArchive className="w-3.5 h-3.5 text-indigo-400" />
              Export Project Codebase
            </h4>
            <p className="text-xs text-slate-400">
              Download the entire project source code (React 19, Vite, TypeScript, Tailwind, Firebase configs & PWA service worker) as a ZIP archive.
            </p>

            <a
              href="/TradeJournal-Project-Export.zip"
              download="TradeJournal-Project-Export.zip"
              onClick={(e) => {
                e.preventDefault();
                downloadProjectZip();
              }}
              className="flex items-center justify-between p-4 rounded-xl bg-[#0a0e17] border border-white/[0.08] hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Code className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">Download Project Source ZIP</p>
                  <p className="text-[11px] text-slate-400">TradeJournal-Project-Export.zip</p>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </a>
          </div>

          {/* Restore Section */}
          <div className="space-y-3 pt-5 border-t border-white/[0.06]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              Restore Trades from Backup
            </h4>
            <p className="text-xs text-slate-400">
              Import a JSON backup to restore your trade history into Firebase Firestore.
            </p>

            {restoreStatus && (
              <div
                className={`flex items-start gap-2.5 rounded-xl p-3.5 text-xs ${
                  restoreStatus.success
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                }`}
              >
                {restoreStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{restoreStatus.message}</span>
              </div>
            )}

            <label className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-white/[0.08] hover:border-cyan-500/40 bg-[#0a0e17] cursor-pointer transition-colors">
              {restoring ? (
                <div className="flex items-center gap-2 text-cyan-400">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span className="text-xs font-semibold">Restoring trades to Firestore...</span>
                </div>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-slate-400 mb-1.5" />
                  <span className="text-xs font-semibold text-slate-200">
                    Select TradeJournal JSON Backup File
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Click to browse files on your device
                  </span>
                </>
              )}
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                disabled={restoring}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.06] px-6 py-3 bg-[#0a0e17] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
