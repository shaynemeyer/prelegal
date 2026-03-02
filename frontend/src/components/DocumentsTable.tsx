"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DeleteDocumentDialog } from "@/components/DeleteDocumentDialog";
import { useAuthStore } from "@/store/useAuthStore";
import { apiDelete } from "@/lib/api";

export interface DocumentRecord {
  id: number;
  doc_type: string;
  doc_name: string;
  fields: Record<string, unknown>;
  created_at: string;
}

interface DocumentsTableProps {
  docs: DocumentRecord[];
  loading: boolean;
  error: string | null;
  onEdit: (doc: DocumentRecord) => void;
  onDeleted: (id: number) => void;
}

export function DocumentsTable({ docs, loading, error, onEdit, onDeleted }: DocumentsTableProps) {
  const token = useAuthStore((s) => s.token);
  const [pendingDelete, setPendingDelete] = useState<DocumentRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await apiDelete(`/api/documents/${pendingDelete.id}`, token);
      onDeleted(pendingDelete.id);
    } catch {
      // silently ignore; row stays in table
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  }

  const columns: ColumnDef<DocumentRecord>[] = [
    {
      accessorKey: "doc_name",
      header: "Document Name",
    },
    {
      accessorKey: "doc_type",
      header: "Type",
      cell: ({ row }) => (
        <span className="capitalize">{row.original.doc_type.replace(/-/g, " ")}</span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Date Saved",
      cell: ({ row }) =>
        new Date(row.original.created_at).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(row.original)}>
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setPendingDelete(row.original)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: docs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading documents...</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (docs.length === 0) {
    return <p className="text-sm text-muted-foreground">No saved documents yet.</p>;
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pendingDelete && (
        <DeleteDocumentDialog
          docName={pendingDelete.doc_name}
          open={!deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}
