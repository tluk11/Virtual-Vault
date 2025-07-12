"use client";

interface DocumentStatsProps {
  documents: any;
  sharedDocuments: any;
}

const DocumentStats = ({ documents, sharedDocuments }: DocumentStatsProps) => {
  const ownCount = documents?.own?.length || 0;
  const sharedWithMeCount = documents?.shared?.length || 0;
  const sharedByMeCount = sharedDocuments?.length || 0;
  const totalSize = documents?.own?.reduce((acc: number, doc: any) => acc + (doc.fileSize || 0), 0) || 0;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const stats = [
    {
      name: "My Documents",
      value: ownCount,
      icon: "📁",
      color: "bg-blue-500",
    },
    {
      name: "Shared with Me",
      value: sharedWithMeCount,
      icon: "🤝",
      color: "bg-green-500",
    },
    {
      name: "Shared by Me",
      value: sharedByMeCount,
      icon: "📤",
      color: "bg-purple-500",
    },
    {
      name: "Total Storage",
      value: formatFileSize(totalSize),
      icon: "💾",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${stat.color} text-white`}>
              <span className="text-lg">{stat.icon}</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentStats; 