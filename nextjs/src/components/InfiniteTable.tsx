import React, { useState, useEffect, useCallback, useRef } from 'react';

export interface TableColumn<T = any> {
  key: string;
  header: string;
  width?: number;
  minWidth?: number;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

export interface InfiniteTableProps<T = any> {
  tableName: string;
  columns: TableColumn<T>[];
  fetchData: (skip: number, limit: number) => Promise<{
    data: T[];
    total: number;
    hasMore: boolean;
  }>;
  rowKey: string | ((row: T) => string);
  initialLimit?: number;
  loadMoreThreshold?: number;
  className?: string;
  emptyMessage?: string;
  loadingMessage?: string;
}

export function InfiniteTable<T = any>({
  tableName,
  columns,
  fetchData,
  rowKey,
  initialLimit = 20,
  loadMoreThreshold = 0.8,
  className = '',
  emptyMessage = 'No data available',
  loadingMessage = 'Loading...'
}: InfiniteTableProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const getRowKey = useCallback((row: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(row);
    }
    return String(row[rowKey as keyof T]) || `row-${index}`;
  }, [rowKey]);

  const loadData = useCallback(async (skip: number, isInitial = false) => {
    if (loadingRef.current && !isInitial) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await fetchData(skip, initialLimit);

      if (isInitial) {
        setData(result.data);
        setInitialLoading(false);
      } else {
        setData(prev => [...prev, ...result.data]);
      }

      setTotalRecords(result.total);
      setHasMore(result.hasMore && result.data.length === initialLimit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [fetchData, initialLimit]);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    if (scrollPercentage >= loadMoreThreshold) {
      loadData(data.length);
    }
  }, [loading, hasMore, loadMoreThreshold, data.length, loadData]);

  useEffect(() => {
    loadData(0, true);
  }, []);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const renderCell = (column: TableColumn<T>, row: T, rowIndex: number) => {
    const value = row[column.key as keyof T];

    if (column.render) {
      return column.render(value, row, rowIndex);
    }

    return value?.toString() || '';
  };

  if (initialLoading) {
    return (
      <div className={`flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
        <div className="flex justify-between items-center px-5 py-4 bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
          <h3 className="m-0 text-base font-semibold text-gray-900">{tableName}</h3>
          <div className="text-xs text-gray-500 font-normal">{loadingMessage}</div>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-gray-500 text-sm">
          <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mr-2"></div>
          <span>{loadingMessage}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
        <div className="flex justify-between items-center px-5 py-4 bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
          <h3 className="m-0 text-base font-semibold text-gray-900">{tableName}</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-red-600">
          <span>Error: {error}</span>
          <button onClick={() => loadData(0, true)} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <div className="flex justify-between items-center px-5 py-4 bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
        <h3 className="m-0 text-base font-semibold text-gray-900">{tableName}</h3>
        <div className="text-xs text-gray-500 font-normal">
          Showing {data.length} of {totalRecords} rows
        </div>
      </div>

      <div className="flex-1 overflow-auto relative" ref={scrollContainerRef}>
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 z-5 bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-2 text-left font-semibold text-gray-900 border-b border-r border-gray-200 bg-gray-50 whitespace-nowrap last:border-r-0"
                  style={{
                    width: column.width,
                    minWidth: column.minWidth || column.width,
                  }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-10 text-gray-500 italic">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={getRowKey(row, index)}
                  className={`border-b border-gray-300 hover:bg-gray-50`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-2 border-r border-gray-200 last:border-r-0 align-top whitespace-nowrap overflow-hidden text-ellipsis"
                      style={{
                        width: column.width,
                        minWidth: column.minWidth || column.width,
                      }}
                    >
                      {renderCell(column, row, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}