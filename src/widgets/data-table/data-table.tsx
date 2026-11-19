import type { ReactNode } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
};

type DataTableProps<T> = {
  data: readonly T[];
  columns: readonly DataTableColumn<T>[];
  getRowId: (row: T) => string | number;
  scrollRegionLabel: string;
  emptyState?: ReactNode;
  tableClassName?: string;
};

export function DataTable<T>({
  data,
  columns,
  getRowId,
  scrollRegionLabel,
  emptyState,
  tableClassName,
}: DataTableProps<T>) {
  if (data.length === 0 && emptyState) return <>{emptyState}</>;

  return (
    <Table scrollRegionLabel={scrollRegionLabel} className={tableClassName}>
      <TableHeader className="bg-muted/40 text-xs uppercase tracking-wide">
        <TableRow className="hover:bg-transparent">
          {columns.map((column) => (
            <TableHead key={column.id} className={column.headerClassName}>
              {column.header}
            </TableHead>
          ))}
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
  );
}
