import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

// =============================================================================
// TABLE — desktop data table
// =============================================================================

interface Column<T> {
  key:          string;
  header:       ReactNode;
  render:       (row: T, index: number) => ReactNode;
  className?:   string;
  headerClass?: string;
  width?:       string;
}

interface TableProps<T> {
  columns:      Column<T>[];
  data:         T[];
  keyExtractor: (row: T, index: number) => string;
  onRowClick?:  (row: T) => void;
  emptyMessage?: string;
  className?:   string;
  stickyHeader?: boolean;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = "No records found.",
  className,
  stickyHeader = false,
}: TableProps<T>) {
  return (
    <div className={cn("w-full overflow-x-auto rounded-xl border border-border shadow-xs", className)}>
      <table className="w-full text-sm border-collapse">
        <thead className={cn(
          "bg-navy-50/75 text-navy-600",
          stickyHeader && "sticky top-0 z-10"
        )}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                style={col.width ? { width: col.width } : undefined}
                className={cn(
                  "text-start font-semibold text-xs uppercase tracking-wider",
                  "px-4 py-3.5 border-b border-border",
                  col.headerClass
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-border">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-navy-500 font-medium">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={keyExtractor(row, index)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "transition-colors duration-100",
                  onRowClick && "cursor-pointer hover:bg-navy-50/60"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn("px-4 py-3.5 text-navy", col.className)}
                  >
                    {col.render(row, index)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// =============================================================================
// CARD LIST — mobile card-per-row list
// =============================================================================

interface CardListProps<T> {
  data:          T[];
  keyExtractor:  (row: T, index: number) => string;
  renderItem:    (row: T, index: number) => ReactNode;
  emptyMessage?: string;
  className?:    string;
  gap?:          "sm" | "md";
}

export function CardList<T>({
  data,
  keyExtractor,
  renderItem,
  emptyMessage = "No records found.",
  className,
  gap = "md",
}: CardListProps<T>) {
  if (data.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-navy-500 font-medium">{emptyMessage}</div>
    );
  }

  return (
    <div className={cn("flex flex-col", gap === "md" ? "gap-3" : "gap-2", className)}>
      {data.map((row, index) => (
        <div key={keyExtractor(row, index)}>
          {renderItem(row, index)}
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// RESPONSIVE WRAPPER — Table on md+, CardList on mobile
// =============================================================================

interface ResponsiveListProps<T> {
  columns:       Column<T>[];
  data:          T[];
  keyExtractor:  (row: T, index: number) => string;
  renderMobile:  (row: T, index: number) => ReactNode;
  onRowClick?:   (row: T) => void;
  emptyMessage?: string;
}

export function ResponsiveList<T>({
  columns,
  data,
  keyExtractor,
  renderMobile,
  onRowClick,
  emptyMessage,
}: ResponsiveListProps<T>) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <Table
          columns={columns}
          data={data}
          keyExtractor={keyExtractor}
          onRowClick={onRowClick}
          emptyMessage={emptyMessage}
        />
      </div>
      {/* Mobile */}
      <div className="md:hidden">
        <CardList
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderMobile}
          emptyMessage={emptyMessage}
        />
      </div>
    </>
  );
}
