"use client";

import { api } from "@packages/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { useState } from "react";
import DocumentCard from "./DocumentCard";
import ShareDocument from "./ShareDocument";

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

interface DocumentListProps {
  documents: Document[];
  activeTab: string;
}

const DocumentList = ({ documents, activeTab }: DocumentListProps) => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const deleteDocument = useMutation(api.vault.deleteDocument);

  const handleDelete = async (documentId: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteDocument({ documentId: documentId as any });
      } catch (error) {
        console.error("Error deleting document:", error);
      }
    }
  };

  const handleShare = (document: Document) => {
    setSelectedDocument(document);
    setShowShareModal(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes("pdf")) return "📄";
    if (type.includes("image")) return "🖼️";
    if (type.includes("video")) return "🎥";
    if (type.includes("audio")) return "🎵";
    if (type.includes("document") || type.includes("word")) return "📝";
    if (type.includes("spreadsheet") || type.includes("excel")) return "📊";
    if (type.includes("presentation") || type.includes("powerpoint")) return "📈";
    return "📁";
  };

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {activeTab === "my-documents" && "No documents yet"}
          {activeTab === "shared-with-me" && "No shared documents"}
          {activeTab === "shared-by-me" && "No documents shared"}
        </h3>
        <p className="text-gray-500">
          {activeTab === "my-documents" && "Upload your first document to get started"}
          {activeTab === "shared-with-me" && "Documents shared with you will appear here"}
          {activeTab === "shared-by-me" && "Documents you share will appear here"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((document) => (
          <DocumentCard
            key={document._id}
            document={document}
            onDelete={() => handleDelete(document._id)}
            onShare={() => handleShare(document)}
            formatFileSize={formatFileSize}
            getFileIcon={getFileIcon}
            canEdit={activeTab === "my-documents"}
          />
        ))}
      </div>

      {showShareModal && selectedDocument && (
        <ShareDocument
          document={selectedDocument}
          onClose={() => {
            setShowShareModal(false);
            setSelectedDocument(null);
          }}
        />
      )}
    </>
  );
};

export default DocumentList; 