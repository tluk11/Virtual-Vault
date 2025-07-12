"use client";

import { api } from "@packages/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { useState } from "react";

interface Document {
  _id: string;
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  category?: string;
  tags?: string[];
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
}

interface DocumentCardProps {
  document: Document;
  onDelete: () => void;
  onShare: () => void;
  formatFileSize: (bytes: number) => string;
  getFileIcon: (fileType: string) => string;
  canEdit: boolean;
}

const DocumentCard = ({ 
  document: documentData, 
  onDelete, 
  onShare, 
  formatFileSize, 
  getFileIcon, 
  canEdit 
}: DocumentCardProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  const downloadUrl = useQuery(api.vault.getDocumentUrl, {
    documentId: documentData._id as any,
  });

  const handleDownload = async () => {
    console.log('Download requested for document:', documentData._id);
    console.log('Download URL:', downloadUrl);
    
    if (!downloadUrl) {
      console.error('No download URL available');
      alert('Download URL not available. Please try again.');
      return;
    }
    
    setIsDownloading(true);
    try {
      console.log('Fetching file from URL:', downloadUrl);
      const response = await fetch(downloadUrl);
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      console.log('Blob size:', blob.size);
      console.log('Blob type:', blob.type);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = documentData.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('Download completed successfully');
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getFileIcon(documentData.fileType)}</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {documentData.title}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                {documentData.fileName}
              </p>
            </div>
          </div>
          {documentData.isPublic && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Public
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {documentData.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {documentData.description}
          </p>
        )}

        {/* Metadata */}
        <div className="space-y-2 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Size:</span>
            <span>{formatFileSize(documentData.fileSize)}</span>
          </div>
          <div className="flex justify-between">
            <span>Type:</span>
            <span className="capitalize">{documentData.fileType}</span>
          </div>
          {documentData.category && (
            <div className="flex justify-between">
              <span>Category:</span>
              <span>{documentData.category}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Created:</span>
            <span>{formatDate(documentData.createdAt)}</span>
          </div>
        </div>

        {/* Tags */}
        {documentData.tags && documentData.tags.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {documentData.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                </span>
              ))}
              {documentData.tags.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  +{documentData.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={handleDownload}
              disabled={isDownloading || !downloadUrl}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-blue-700" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Downloading...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download
                </>
              )}
            </button>
            
            <button
              onClick={onShare}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Share
            </button>
          </div>

          {canEdit && (
            <button
              onClick={onDelete}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentCard; 