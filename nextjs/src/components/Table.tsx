"use client"

import * as React from "react"
import { useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

// Simple DataTable with lazy loading
export interface SimpleDataTableProps<T> {
  apiEndpoint: string;
  renderHeader: () => ReactNode;
  renderRow: (item: T, index: number) => ReactNode;
  getItemId: (item: T) => string | number;
  className?: string;
  transformResponse?: (response: any) => { data: T[], total: number };
}

function DataTable<T>({
  apiEndpoint,
  renderHeader,
  renderRow,
  getItemId,
  className = '',
  transformResponse
}: SimpleDataTableProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Simple fetch function - removed from useCallback to avoid dependency issues
  const loadData = async (skip: number = 0, limit: number = 20) => {
    if (loading) return;

    console.log(`Loading data: skip=${skip}, limit=${limit}`);
    setLoading(true);
    try {
      const response = await fetch(`${apiEndpoint}?skip=${skip}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const rawData = await response.json();
      const data = transformResponse ? transformResponse(rawData) : rawData;

      console.log('Received data:', data);

      if (skip === 0) {
        setItems(data.data || []);
        setOffset(0);
      } else {
        setItems(prev => [...prev, ...(data.data || [])]);
      }

      // Check if we have more data
      const receivedCount = (data.data || []).length;
      const newOffset = skip + receivedCount;
      setHasMore(receivedCount === limit && receivedCount > 0);
      setOffset(newOffset);

      console.log(`HasMore: ${receivedCount === limit}, New Offset: ${newOffset}`);
    } catch (error) {
      console.error('Error loading data:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data only when apiEndpoint changes
  useEffect(() => {
    console.log('Initial load for endpoint:', apiEndpoint);
    setItems([]);
    setOffset(0);
    setHasMore(true);
    loadData(0, 20);
  }, [apiEndpoint]);

  // Simple scroll-based loading - removed dependencies that cause issues
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const nearBottom = scrollTop + clientHeight >= scrollHeight - 50;

      console.log(`Scroll check - Near bottom: ${nearBottom}, HasMore: ${hasMore}, Loading: ${loading}, Offset: ${offset}`);

      if (nearBottom && hasMore && !loading) {
        console.log(`Triggering load with offset: ${offset}`);
        loadData(offset, 20);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  });

  // Also add a manual trigger for testing
  const loadMore = () => {
    if (!loading && hasMore) {
      loadData(offset, 20);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative h-full overflow-auto", className)}>
      <div className="sticky top-0 z-10 bg-gray-50 p-3 text-sm border-b flex justify-between items-center">
        <span>
          {items.length} items {loading && '(loading...)'} {hasMore ? '(more available)' : '(no more)'}
        </span>
        {hasMore && !loading && (
          <button
            onClick={loadMore}
            className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
          >
            Load More
          </button>
        )}
      </div>

      <Table>
        <TableHeader className="sticky z-10 bg-slate-50" style={{ top: '52px' }}>
          {renderHeader()}
        </TableHeader>

        <TableBody>
          {items.map((item, index) => (
            <TableRow key={getItemId(item)}>
              {renderRow(item, index)}
            </TableRow>
          ))}

          {loading && (
            <TableRow>
              <TableCell colSpan={100} className="text-center py-4 text-gray-500">
                Loading more items...
              </TableCell>
            </TableRow>
          )}

          {!hasMore && items.length > 0 && (
            <TableRow>
              <TableCell colSpan={100} className="text-center py-4 text-gray-400">
                No more items to load
              </TableCell>
            </TableRow>
          )}

          {items.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={100} className="text-center py-8 text-gray-500">
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Scroll trigger area */}
      <div className="h-20 flex items-center justify-center text-gray-400 text-sm">
        {hasMore && !loading && 'Scroll down for more...'}
      </div>
    </div>
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  DataTable
}