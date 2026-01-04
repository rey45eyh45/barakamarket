import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  hideOnMobile?: boolean;
  className?: string;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  emptyState?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  actions,
  emptyState,
  loading = false,
  className = ''
}: ResponsiveTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  const toggleRow = (key: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedRows(newExpanded);
  };

  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aVal = (a as any)[sortColumn];
      const bVal = (b as any)[sortColumn];

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return <div className="text-center py-12">{emptyState}</div>;
  }

  return (
    <div className={className}>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 ${column.className || ''}`}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition"
                    >
                      {column.label}
                      {sortColumn === column.key && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          {sortDirection === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </motion.div>
                      )}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y dark:divide-gray-800">
            {sortedData.map((item) => (
              <motion.tr
                key={keyExtractor(item)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => onRowClick?.(item)}
                className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''} transition`}
              >
                {columns.map((column) => (
                  <td key={column.key} className={`px-4 py-4 text-sm text-gray-900 dark:text-gray-100 ${column.className || ''}`}>
                    {column.render ? column.render(item) : (item as any)[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    {actions(item)}
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {sortedData.map((item) => {
          const key = keyExtractor(item);
          const isExpanded = expandedRows.has(key);
          const visibleColumns = columns.filter(c => !c.hideOnMobile);
          const hiddenColumns = columns.filter(c => c.hideOnMobile);

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden"
            >
              {/* Main Content */}
              <div
                onClick={() => onRowClick?.(item)}
                className={`p-4 ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {visibleColumns.map((column) => (
                  <div key={column.key} className="mb-2 last:mb-0">
                    <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                      {column.label}
                    </span>
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {column.render ? column.render(item) : (item as any)[column.key]}
                    </div>
                  </div>
                ))}

                {/* Expand Button */}
                {hiddenColumns.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRow(key);
                    }}
                    className="mt-3 text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1"
                  >
                    {isExpanded ? (
                      <>
                        Kamroq ko'rsatish
                        <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Ko'proq ko'rsatish
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && hiddenColumns.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 space-y-2"
                  >
                    {hiddenColumns.map((column) => (
                      <div key={column.key}>
                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                          {column.label}
                        </span>
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {column.render ? column.render(item) : (item as any)[column.key]}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              {actions && (
                <div className="border-t dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
                  {actions(item)}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
