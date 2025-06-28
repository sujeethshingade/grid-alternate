"use client";

import { useState } from "react";
import {
  DataTable,
  TableCell,
  TableHead,
  TableRow
} from "./../components/table";

interface FileDocument {
  _id: string;
  name: string;
  type?: string;
  modified?: string;
  modifiedBy?: string;
  fileSize?: number;
  location?: string;
  createdBy?: string;
}

interface GridProps {
  className?: string;
  apiEndpoint?: string;
}

function Grid({
  className = '',
  apiEndpoint = '/api/files'
}: GridProps) {

  const transformResponse = (response: any) => {
    console.log('Grid received response:', response);

    // Handle different response formats
    let data = [];
    let total = 0;

    if (response.files && Array.isArray(response.files)) {
      data = response.files;
      total = response.totalRecords || response.files.length;
    } else if (response.data && Array.isArray(response.data)) {
      data = response.data;
      total = response.total || response.data.length;
    } else if (Array.isArray(response)) {
      data = response;
      total = response.length;
    } else {
      console.warn('Unknown response format:', response);
      data = [];
      total = 0;
    }

    console.log(`Transformed: ${data.length} items, total: ${total}`);
    return { data, total };
  };

  return (
    <div className="w-full h-full">
      {/* Debug info */}
      <div className="bg-yellow-50 border border-yellow-200 p-2 mb-2 text-xs">
        API Endpoint: {apiEndpoint}
      </div>

      <DataTable<FileDocument>
        apiEndpoint={apiEndpoint}
        className={className}
        getItemId={(file) => file._id}
        transformResponse={transformResponse}
        renderHeader={() => (
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Modified</TableHead>
            <TableHead>Modified By</TableHead>
            <TableHead>File Size</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Created By</TableHead>
          </TableRow>
        )}
        renderRow={(file) => (
          <>
            <TableCell className="font-medium">{file.name}</TableCell>
            <TableCell>{file.type || '-'}</TableCell>
            <TableCell>{file.modified || '-'}</TableCell>
            <TableCell>{file.modifiedBy || '-'}</TableCell>
            <TableCell>{file.fileSize ? `${file.fileSize} bytes` : '-'}</TableCell>
            <TableCell>{file.location || '-'}</TableCell>
            <TableCell>{file.createdBy || '-'}</TableCell>
          </>
        )}
      />
    </div>
  );
}

// Test component to verify API structure
export function GridTest({ apiEndpoint = '/api/files' }: { apiEndpoint?: string }) {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiEndpoint}?skip=0&limit=5`);
      const data = await res.json();
      setResponse(data);
      console.log('Test API Response:', data);
    } catch (error) {
      console.error('Test API Error:', error);
      setResponse({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded bg-gray-50">
      <h3 className="font-bold mb-2">API Test</h3>
      <button
        onClick={testAPI}
        disabled={loading}
        className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test API'}
      </button>
      {response && (
        <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-40">
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default Grid;