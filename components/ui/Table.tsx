
import React from 'react';

export interface ColumnDefinition<T,> {
  key: keyof T | string; // Allow string for custom render keys
  header: string;
  render?: (item: T) => React.ReactNode; // Optional custom render function
  className?: string; // class for td
  headerClassName?: string; // class for th
}

interface TableProps<T,> {
  data: T[];
  columns: ColumnDefinition<T>[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyStateMessage?: string;
  tableClassName?: string;
  headerClassName?: string;
  rowClassName?: string;
  cellClassName?: string;
}

const Table = <T extends { id: string | number },>(
  {
    data,
    columns,
    onRowClick,
    isLoading = false,
    emptyStateMessage = "Nenhum dado encontrado.",
    tableClassName = "min-w-full divide-y divide-gray-700",
    headerClassName = "bg-gray-800 bg-opacity-50",
    rowClassName = "hover:bg-gray-700 transition-colors duration-150",
    cellClassName = "px-6 py-4 whitespace-nowrap text-sm text-gray-300"
  }: TableProps<T>
): React.ReactElement => {
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-vermelho-bordo"></div>
        <span className="ml-3 text-gray-300">Carregando...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <p>{emptyStateMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto shadow rounded-lg border border-gray-700">
      <table className={tableClassName}>
        <thead className={headerClassName}>
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider ${col.headerClassName || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-azul-marinho divide-y divide-gray-700">
          {data.map((item) => (
            <tr 
              key={item.id} 
              className={`${rowClassName} ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick && onRowClick(item)}
            >
              {columns.map((col) => (
                <td key={`${item.id}-${String(col.key)}`} className={`${cellClassName} ${col.className || ''}`}>
                  {col.render ? col.render(item) : (item[col.key as keyof T] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
    