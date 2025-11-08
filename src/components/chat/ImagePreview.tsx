'use client';

import { useState } from 'react';

interface ImagePreviewProps {
  file: File;
  onRemove: () => void;
  isAnalyzing?: boolean;
}

export default function ImagePreview({ file, onRemove, isAnalyzing = false }: ImagePreviewProps) {
  const [preview, setPreview] = useState<string>('');

  // Generate preview on mount
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) {
      setPreview(e.target.result as string);
    }
  };
  reader.readAsDataURL(file);

  const fileSize = (file.size / 1024 / 1024).toFixed(2);

  return (
    <div className="relative group">
      <div className="rounded-lg overflow-hidden bg-gradient-to-br from-orb-purple/20 to-blue-500/20 border border-orb-purple/30 p-2">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 max-w-full rounded-md object-cover"
            />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-md">
                <div className="animate-spin">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-8 h-8 mx-auto mb-2 text-orb-purple/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs text-gray-600">Loading...</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="text-xs text-gray-600">
          <p className="truncate font-medium">{file.name}</p>
          <p>{fileSize} MB</p>
        </div>
        <button
          onClick={onRemove}
          disabled={isAnalyzing}
          className="ml-2 p-1 rounded-md bg-red-100 hover:bg-red-200 text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Remove image"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
