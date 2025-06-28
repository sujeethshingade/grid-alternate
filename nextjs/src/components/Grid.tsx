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
  className?: string;
}

export function Grid({ className }: FileTableProps) {
  const [files, setFiles] = useState<FileDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observerRef = useRef<HTMLDivElement>(null);

  const fetchFiles = useCallback(async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/files?page=${pageNum}&limit=50`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: FilesResponse = await response.json();
      
      if (pageNum === 1) {
        setFiles(data.files);
      } else {
        setFiles(prev => [...prev, ...data.files]);
      }
      
      setHasMore(pageNum < data.totalPages);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  }, []);

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
    <div className={`h-full overflow-auto ${className}`}>
      <Table>
        <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
          <TableRow>
            <TableHead className="w-[250px]">Name</TableHead>
            <TableHead className="w-[100px]">Type</TableHead>
            <TableHead className="w-[120px]">Modified</TableHead>
            <TableHead className="w-[150px]">Modified By</TableHead>
            <TableHead className="w-[100px]">File Size</TableHead>
            <TableHead className="w-[200px]">Location</TableHead>
            <TableHead className="w-[150px]">Created By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file._id} className="hover:bg-gray-50">
              <TableCell className="font-medium">{file.name || "-"}</TableCell>
              <TableCell>{file.type || "-"}</TableCell>
              <TableCell>{formatDate(file.modified)}</TableCell>
              <TableCell>{file.modifiedBy || "-"}</TableCell>
              <TableCell>{formatFileSize(file.fileSize)}</TableCell>
              <TableCell>{file.location || "-"}</TableCell>
              <TableCell>{file.createdBy || "-"}</TableCell>
            </TableRow>
          ))}
          {loading && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
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