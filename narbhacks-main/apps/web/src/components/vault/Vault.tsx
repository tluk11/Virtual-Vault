"use client";

import { api } from "@packages/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import DocumentList from "./DocumentList";
import UploadDocument from "./UploadDocument";
import DocumentStats from "./DocumentStats";

type TabType = "my-documents" | "shared-with-me" | "shared-by-me";

const Vault = () => {
  const [activeTab, setActiveTab] = useState<TabType>("my-documents");
  const [search, setSearch] = useState("");

  const documents = useQuery(api.vault.getDocuments);
  const sharedDocuments = useQuery(api.vault.getSharedDocuments);

  const tabs = [
    { id: "my-documents" as TabType, label: "My Documents", count: documents?.own?.length || 0 },
    { id: "shared-with-me" as TabType, label: "Shared with Me", count: documents?.shared?.length || 0 },
    { id: "shared-by-me" as TabType, label: "Shared by Me", count: sharedDocuments?.length || 0 },
  ];

  const getCurrentDocuments = () => {
    switch (activeTab) {
      case "my-documents":
        return documents?.own || [];
      case "shared-with-me":
        return documents?.shared || [];
      case "shared-by-me":
        return sharedDocuments || [];
      default:
        return [];
    }
  };

  const filteredDocuments = getCurrentDocuments().filter((doc) =>
    doc.title.toLowerCase().includes(search.toLowerCase()) ||
    doc.description?.toLowerCase().includes(search.toLowerCase()) ||
    doc.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Virtual Vault</h1>
        <p className="text-gray-600">Secure document storage and sharing</p>
      </div>

      {/* Stats */}
      <DocumentStats documents={documents} sharedDocuments={sharedDocuments} />

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <UploadDocument />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Document List */}
      <DocumentList 
        documents={filteredDocuments} 
        activeTab={activeTab}
      />
    </div>
  );
};

export default Vault; 