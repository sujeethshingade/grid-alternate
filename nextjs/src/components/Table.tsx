"use client"

import * as React from "react"
import { useState, useEffect, useRef, ReactNode } from "react";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Table components
function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="relative w-full overflow-x-auto">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead className={cn("[&_tr]:border-b", className)} {...props} />
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr className={cn("hover:bg-muted/50 border-b transition-colors", className)} {...props} />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th className={cn("h-10 px-2 text-left align-middle font-medium", className)} {...props} />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("p-2 align-middle", className)} {...props} />
}

// Column definition interface
export interface ColumnDef<T> {
  key: string;
  label: string;
  render?: (value: any, item: T) => ReactNode;
  className?: string;
}

// Main DataTable interface
export interface DataTableProps<T> {
  apiEndpoint: string;
  columns: ColumnDef<T>[];
  getItemId: (item: T) => string | number;
  className?: string;
  transformResponse?: (response: any) => { data: T[], total: number };
  pageSize?: number;
}

// Optimized DataTable with infinite scroll
function DataTable<T>({
  apiEndpoint,
  columns,
  getItemId,
  className = '',
  transformResponse,
  pageSize = 20
}: DataTableProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const loadData = async (currentSkip: number) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const response = await fetch(`${apiEndpoint}?skip=${currentSkip}&limit=${pageSize}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const rawData = await response.json();
      const { data, total } = transformResponse ? transformResponse(rawData) : rawData;

      if (currentSkip === 0) {
        setItems(data || []);
      } else {
        setItems(prev => [...prev, ...(data || [])]);
      }

      const newSkip = currentSkip + (data?.length || 0);
      setSkip(newSkip);
      setHasMore((data?.length || 0) === pageSize);

    } catch (error) {
      console.error('Error loading data:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  // Initial load
  useEffect(() => {
    setItems([]);
    setSkip(0);
    setHasMore(true);
    loadData(0);
  }, [apiEndpoint]);

  // Infinite scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollTop + clientHeight >= scrollHeight - 100 && hasMore && !loading) {
        loadData(skip);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [skip, hasMore, loading]);

  return (
    <div ref={containerRef} className={cn("h-full overflow-auto", className)}>
      <Table>
        <TableHeader className="sticky top-0 bg-white z-10">
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((item) => (
            <TableRow key={getItemId(item)}>
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.render
                    ? column.render((item as any)[column.key], item)
                    : (item as any)[column.key] || '-'
                  }
                </TableCell>
              ))}
            </TableRow>
          ))}

          {loading && (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-4">
                Loading...
              </TableCell>
            </TableRow>
          )}

          {!hasMore && items.length > 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-4 text-gray-500">
                No more data
              </TableCell>
            </TableRow>
          )}

          {items.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                No data found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export { DataTable, Table, TableHeader, TableBody, TableRow, TableHead, TableCell }