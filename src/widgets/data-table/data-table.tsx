import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTablePagination, type DataTablePaginationProps } from './data-table-pagination';

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  sortKey?: string;
  headerClassName?: string;
  cellClassName?: string;
};

export type DataTableSorting = {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string) => void;
};

type DataTableProps<T> = {
  data: readonly T[];
  columns: readonly DataTableColumn<T>[];
  getRowId: (row: T) => string | number;
  scrollRegionLabel: string;
  emptyState?: ReactNode;
  tableClassName?: string;
  pagination?: DataTablePaginationProps;
  sorting?: DataTableSorting;
  maxHeight?: number;
};

export function DataTable<T>({
  data,
  columns,
  getRowId,
  scrollRegionLabel,
  emptyState,
  tableClassName,
  pagination,
  sorting,
  maxHeight = 560,
}: DataTableProps<T>) {
  return (
    <div>
      {data.length === 0 && emptyState ? (
        emptyState
      ) : (
        <Table
          scrollRegionLabel={scrollRegionLabel}
          className={tableClassName}
          containerClassName="overflow-y-auto"
          containerStyle={{ maxHeight }}
        >
          <TableHeader className="sticky top-0 z-10 bg-muted text-xs uppercase tracking-wide">
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => {
                const sortKey = column.sortKey;
                const isActiveSort = sorting?.sortBy === sortKey;
                const headerLabel = typeof column.header === 'string' ? column.header : column.id;

                return (
                  <TableHead key={column.id} className={column.headerClassName}>
                    {sortKey && sorting ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="-ml-3 uppercase tracking-wide"
                        aria-label={`Sort by ${headerLabel}${
                          isActiveSort ? `, ${sorting.sortOrder === 'asc' ? 'ascending' : 'descending'}` : ''
                        }`}
                        onClick={() => sorting.onSortChange(sortKey)}
                      >
                        {column.header}
                        {!isActiveSort ? (
                          <ArrowUpDown aria-hidden="true" className="size-3.5" />
                        ) : sorting.sortOrder === 'asc' ? (
                          <ArrowUp aria-hidden="true" className="size-3.5" />
                        ) : (
                          <ArrowDown aria-hidden="true" className="size-3.5" />
                        )}
                      </Button>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((row) => (
                <TableRow key={getRowId(row)}>
                  {columns.map((column) => (
                    <TableCell key={column.id} className={column.cellClassName}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
      {pagination ? <DataTablePagination {...pagination} /> : null}
    </div>
  );
}
