"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteDocumentDialogProps {
  docName: string;
  open: boolean;
  deleting: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteDocumentDialog({ docName, open, deleting, error, onConfirm, onCancel }: DeleteDocumentDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => { if (!isOpen && !deleting) onCancel(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete document?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{docName}&quot;? This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="px-1 text-sm text-destructive">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
