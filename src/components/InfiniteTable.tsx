import React, { useState, useEffect, useCallback, useRef } from 'react';

export interface TableColumn<T = any> {
  key: string;
  header: string;
  width?: number;
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
  loadMoreThreshold = 0.6,
  emptyMessage = 'No files found',
  loadingMessage = 'Loading files...'
}: InfiniteTableProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
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

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allKeys = data.map((row, index) => getRowKey(row, index));
      setSelectedRows(new Set(allKeys));
    } else {
      setSelectedRows(new Set());
    }
  }, [data, getRowKey]);

  const handleRowSelect = useCallback((rowKey: string, checked: boolean) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(rowKey);
      } else {
        newSet.delete(rowKey);
      }
      return newSet;
    });
  }, []);

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

  const isAllSelected = data.length > 0 && selectedRows.size === data.length;
  const isIndeterminate = selectedRows.size > 0 && selectedRows.size < data.length;

  if (initialLoading) {
    return (
      <div className={"flex flex-col h-full bg-white border border-gray-200 overflow-hidden"}>
        <div className="flex justify-between items-center px-4 py-4 bg-white border-b border-gray-200 sticky top-0 z-10">
          <h3 className="m-0 text-base font-semibold text-gray-900">{tableName}</h3>
          <div className="text-xs text-gray-700 font-normal">{loadingMessage}</div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-gray-700 text-sm">
          <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mr-2"></div>
          <span>{loadingMessage}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={"flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden"}>
      <div className="flex justify-between items-center px-4 py-4 bg-white border-b border-gray-200 sticky top-0 z-10">
        <h3 className="m-0 text-base font-semibold text-gray-900">{tableName}</h3>
        <div className="text-xs text-gray-700 font-normal">
          Showing {data.length} of {totalRecords} rows
          {selectedRows.size > 0 && (
            <span className="ml-2 text-blue-600 font-medium">
              • {selectedRows.size} selected
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto relative" ref={scrollContainerRef}>
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 z-5 bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-gray-900 border-b border-gray-200 bg-gray-100 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 focus:ring-blue-500"
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-2 text-left font-semibold text-gray-900 border-b border-gray-200 bg-gray-100 whitespace-nowrap"
                  style={{
                    width: column.width
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
                <td colSpan={columns.length + 1} className="text-center py-10 text-gray-700 italic">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const key = getRowKey(row, index);
                const isSelected = selectedRows.has(key);
                return (
                  <tr
                    key={key}
                    className={`border-b border-gray-200 hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''
                      }`}
                  >
                    <td className="px-4 py-2 align-top w-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleRowSelect(key, e.target.checked)}
                        className="rounded border-gray-300 focus:ring-blue-500"
                      />
                    </td>
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="px-4 py-2 align-top whitespace-nowrap overflow-hidden text-ellipsis"
                        style={{
                          width: column.width
                        }}
                      >
                        {renderCell(column, row, index)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}