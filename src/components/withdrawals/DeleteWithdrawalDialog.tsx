
import { useState } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { Withdrawal, withdrawalApi } from "@/lib/db";
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

interface DeleteWithdrawalDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  withdrawal: Withdrawal | null;
  onSuccess: () => void;
}

export function DeleteWithdrawalDialog({
  isOpen,
  onOpenChange,
  withdrawal,
  onSuccess,
}: DeleteWithdrawalDialogProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const confirmDeleteWithdrawal = async () => {
    if (!currentUser || !withdrawal) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to delete a withdrawal.",
      });
      return;
    }

    setDeleteLoading(true);
    try {
      const success = await withdrawalApi.delete(withdrawal.id!, currentUser);
      
      if (success) {
        toast({
          title: "Withdrawal Deleted",
          description: `Successfully deleted withdrawal of ${formatCurrency(Number(withdrawal.amount))}`,
        });
        
        // Notify parent of success
        onSuccess();
      } else {
        throw new Error("Failed to delete withdrawal");
      }
    } catch (error: any) {
      console.error("Error deleting withdrawal:", error);
      toast({
        variant: "destructive",
        title: "Failed to Delete Withdrawal",
        description: error.message || "There was a problem deleting the withdrawal.",
      });
    } finally {
      setDeleteLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this withdrawal? This action cannot be undone.
            {withdrawal && (
              <div className="mt-4 p-3 border rounded-md bg-muted/50">
                <p><span className="font-medium">Date:</span> {formatDate(withdrawal.date)}</p>
                <p><span className="font-medium">Recipient:</span> {withdrawal.recipient}</p>
                <p><span className="font-medium">Amount:</span> {formatCurrency(Number(withdrawal.amount))}</p>
                {withdrawal.description && (
                  <p><span className="font-medium">Description:</span> {withdrawal.description}</p>
                )}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              confirmDeleteWithdrawal();
            }}
            disabled={deleteLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteLoading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground"></span>
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
