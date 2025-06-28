"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

interface FilesResponse {
  files: FileDocument[];
  totalRecords: number;
  currentPage: number;
  totalPages: number;
}

interface FileTableProps {
  /** Additional CSS class name for the container */
  className?: string;
  /** API endpoint for fetching files (default: '/api/files') */
  apiEndpoint?: string;
  /** Number of files to fetch per page (default: 50) */
  pageSize?: number;
  /** Whether to show the file count indicator above the table (default: true) */
  showFileCount?: boolean;
  /** Offset in pixels for sticky header positioning when file count is shown (default: 52) */
  stickyHeaderOffset?: number;
}

export function Grid({
  className = '',
  apiEndpoint = '/api/files',
  pageSize = 50,
  showFileCount = true,
  stickyHeaderOffset = 52
}: FileTableProps) {
  const [files, setFiles] = useState<FileDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const observerRef = useRef<HTMLDivElement>(null);

  const fetchFiles = useCallback(async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${apiEndpoint}?page=${pageNum}&limit=${pageSize}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FilesResponse = await response.json();

      if (pageNum === 1) {
        setFiles(data.files);
      } else {
        setFiles(prev => [...prev, ...data.files]);
      }

      setTotalRecords(data.totalRecords);
      setHasMore(pageNum < data.totalPages);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, pageSize]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading]);

  // Fetch files when page changes
  useEffect(() => {
    fetchFiles(page);
  }, [page, fetchFiles]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "-";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`relative h-full overflow-auto border border-gray-200 rounded-lg ${className}`}>
      {/* Files count display */}
      {showFileCount && (
        <div className="sticky top-0 z-30 bg-gray-50 border-b border-gray-200 shadow-sm px-4 py-3 backdrop-blur-sm">
          <div className="text-sm text-gray-600 font-semibold">
            Fetched {files.length} files out of {totalRecords} files
          </div>
        </div>
      )}

      <Table>
        <TableHeader
          className="sticky z-20 bg-slate-50 border-b-2 border-slate-300 shadow-lg backdrop-blur-sm"
          style={{ top: showFileCount ? `${stickyHeaderOffset}px` : '0px' }}
        >
          <TableRow>
            <TableHead className="w-[250px] bg-slate-50 font-semibold text-sm text-slate-700 px-4 py-3 border-b-2 border-slate-300">Name</TableHead>
            <TableHead className="w-[100px] bg-slate-50 font-semibold text-sm text-slate-700 px-4 py-3 border-b-2 border-slate-300">Type</TableHead>
            <TableHead className="w-[120px] bg-slate-50 font-semibold text-sm text-slate-700 px-4 py-3 border-b-2 border-slate-300">Modified</TableHead>
            <TableHead className="w-[150px] bg-slate-50 font-semibold text-sm text-slate-700 px-4 py-3 border-b-2 border-slate-300">Modified By</TableHead>
            <TableHead className="w-[100px] bg-slate-50 font-semibold text-sm text-slate-700 px-4 py-3 border-b-2 border-slate-300">File Size</TableHead>
            <TableHead className="w-[200px] bg-slate-50 font-semibold text-sm text-slate-700 px-4 py-3 border-b-2 border-slate-300">Location</TableHead>
            <TableHead className="w-[150px] bg-slate-50 font-semibold text-sm text-slate-700 px-4 py-3 border-b-2 border-slate-300">Created By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow
              key={file._id}
              className="hover:bg-gray-50 transition-colors border-b border-gray-200"
            >
              <TableCell className="font-medium py-3 px-4">{file.name || "-"}</TableCell>
              <TableCell className="py-3 px-4">{file.type || "-"}</TableCell>
              <TableCell className="py-3 px-4">{formatDate(file.modified)}</TableCell>
              <TableCell className="py-3 px-4">{file.modifiedBy || "-"}</TableCell>
              <TableCell className="py-3 px-4">{formatFileSize(file.fileSize)}</TableCell>
              <TableCell className="py-3 px-4">{file.location || "-"}</TableCell>
              <TableCell className="py-3 px-4">{file.createdBy || "-"}</TableCell>
            </TableRow>
          ))}
          {loading && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500 italic">
                Loading more files...
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* Intersection observer target */}
      <div ref={observerRef} className="h-4" />
    </div>
  );
}