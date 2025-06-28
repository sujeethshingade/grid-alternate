"use client";

import { useState } from "react";
import { DataTable, ColumnDef } from "./../components/Table";

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

export default function HomePage() {
  const [apiEndpoint] = useState('/api/files');

  // Define columns for the file collection
  const fileColumns: ColumnDef<FileDocument>[] = [
    {
      key: 'name',
      label: 'Name',
      className: 'font-medium min-w-48'
    },
    {
      key: 'type',
      label: 'Type',
      className: 'min-w-24'
    },
    {
      key: 'modified',
      label: 'Modified',
      className: 'min-w-32',
    },
    {
      key: 'modifiedBy',
      label: 'Modified By',
      className: 'min-w-32'
    },
    {
      key: 'fileSize',
      label: 'Size',
      className: 'min-w-24',
    },
    {
      key: 'location',
      label: 'Location',
      className: 'min-w-48'
    },
    {
      key: 'createdBy',
      label: 'Created By',
      className: 'min-w-32'
    }
  ];

  // Transform API response to match DataTable expectations
  const transformResponse = (response: any) => {
    return {
      data: response.files || [],
      total: response.totalRecords || 0
    };
  };

  return (
    <div className="container mx-auto p-4 h-screen">
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-2">File Management</h1>
          <p className="text-gray-600">Browse and manage your files</p>
        </div>

        <div className="flex-1 border rounded-lg overflow-hidden">
          <DataTable<FileDocument>
            apiEndpoint={apiEndpoint}
            columns={fileColumns}
            getItemId={(file) => file._id}
            transformResponse={transformResponse}
            pageSize={20}
          />
        </div>
      </div>
    </div>
  );
}