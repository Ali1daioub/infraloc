"use client";

import React, { useState, useRef } from "react";
import { importApi } from "@/lib/api";

interface Props {
  projectId: string;
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

const SUPPORTED_FORMATS = [
  { ext: ".xer", name: "Primavera P6 (XER)" },
  { ext: ".xml", name: "Primavera PMXML / MS Project XML" },
  { ext: ".mpp", name: "Microsoft Project (MPP)" },
  { ext: ".pp", name: "Asta Powerproject (PP)" },
  { ext: ".sdef", name: "SDEF (USACE)" },
  { ext: ".xlsx", name: "Excel Spreadsheet" },
];

export default function ImportDialog({ projectId, open, onClose, onImported }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const res = await importApi.upload(projectId, file);
      setResult(res.data);
      onImported();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Import failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-[500px] max-w-[90vw] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-900 mb-4">Import Schedule File</h2>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p className="mb-2">Supported formats:</p>
            <div className="grid grid-cols-2 gap-1">
              {SUPPORTED_FORMATS.map((f) => (
                <div key={f.ext} className="text-xs text-gray-500">
                  <span className="font-mono font-bold text-gray-700">{f.ext}</span> {f.name}
                </div>
              ))}
            </div>
          </div>

          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".xer,.xml,.mpp,.pp,.sdef,.xlsx,.mpx,.csv"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setResult(null);
                setError(null);
              }}
            />
            {file ? (
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Click to select a schedule file</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
              <p className="font-semibold">Import successful!</p>
              <div className="mt-1 text-xs grid grid-cols-2 gap-1">
                <span>Activities: {result.activities_imported}</span>
                <span>Dependencies: {result.dependencies_imported}</span>
                <span>Calendars: {result.calendars_imported}</span>
                <span>WBS Nodes: {result.wbs_nodes_imported}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={onClose}
            >
              {result ? "Done" : "Cancel"}
            </button>
            {!result && (
              <button
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={!file || uploading}
                onClick={handleUpload}
              >
                {uploading ? "Importing..." : "Import"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
