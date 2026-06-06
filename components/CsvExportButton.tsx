"use client";

import { Download } from "lucide-react";
import { downloadCsv } from "@/lib/utils";

interface CsvExportButtonProps {
  filename: string;
  headers: string[];
  rows: string[][];
  label?: string;
  disabled?: boolean;
}

export default function CsvExportButton({
  filename,
  headers,
  rows,
  label = "CSVエクスポート",
  disabled = false,
}: CsvExportButtonProps) {
  const handleExport = () => {
    if (disabled) return;
    downloadCsv(filename, [headers, ...rows]);
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Download size={16} />
      {label}
    </button>
  );
}
