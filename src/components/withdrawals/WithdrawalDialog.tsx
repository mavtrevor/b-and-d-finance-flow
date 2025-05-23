
import { useState } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/formatters";
import { Withdrawal, withdrawalApi } from "@/lib/db";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WithdrawalForm, WithdrawalFormValues } from "./WithdrawalForm";

interface WithdrawalDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
  currentWithdrawal: Withdrawal | null;
  onSuccess: () => void;
  currentMonth: string;
}

export function WithdrawalDialog({
  isOpen,
  onOpenChange,
  isEditMode,
  currentWithdrawal,
  onSuccess,
  currentMonth,
}: WithdrawalDialogProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Dialog title and descriptions based on mode
  const dialogTitle = isEditMode ? "Edit Withdrawal" : "Record Withdrawal";
  const dialogDescription = isEditMode 
    ? "Update the details for this partner withdrawal." 
    : "Enter the details for this partner withdrawal.";
  const submitButtonText = isEditMode ? "Update Withdrawal" : "Record Withdrawal";

  // Get default values for the form
  const getDefaultValues = () => {
    if (isEditMode && currentWithdrawal) {
      return {
        date: currentWithdrawal.date.toISOString().split('T')[0],
        amount: Number(currentWithdrawal.amount),
        recipient: currentWithdrawal.recipient,
        description: currentWithdrawal.description || "",
      };
    } else {
      return {
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        recipient: "",
        description: "",
      };
    }
  };

  const handleSubmit = async (values: WithdrawalFormValues) => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to record a withdrawal.",
      });
      return;
    }

    setSubmitLoading(true);
    try {
      if (isEditMode && currentWithdrawal) {
        // Handle update
        const withdrawalData: Partial<Withdrawal> = {
          date: new Date(values.date),
          amount: values.amount,
          recipient: values.recipient,
          description: values.description,
        };

        const result = await withdrawalApi.update(currentWithdrawal.id!, withdrawalData, currentUser);
        
        if (result) {
          toast({
            title: "Withdrawal Updated",
            description: `Successfully updated the withdrawal of ${formatCurrency(values.amount)} to ${values.recipient}`,
          });
        } else {
          throw new Error("Failed to update withdrawal");
        }
      } else {
        // Handle create
        const withdrawalData: Omit<Withdrawal, 'id' | 'createdAt' | 'updatedAt'> = {
          date: new Date(values.date),
          amount: values.amount,
          recipient: values.recipient,
          description: values.description,
          monthYear: currentMonth,
        };

        const result = await withdrawalApi.add(withdrawalData, currentUser);
        
        if (result) {
          toast({
            title: "Withdrawal Recorded",
            description: `Successfully recorded a withdrawal of ${formatCurrency(values.amount)} to ${values.recipient}`,
          });
        } else {
          throw new Error("Failed to record withdrawal");
        }
      }
      
      // Close dialog and notify parent of success
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'recording'} withdrawal:`, error);
      toast({
        variant: "destructive",
        title: `Failed to ${isEditMode ? 'Update' : 'Record'} Withdrawal`,
        description: error.message || `There was a problem ${isEditMode ? 'updating' : 'recording'} the withdrawal.`,
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>

        <WithdrawalForm
          defaultValues={getDefaultValues()}
          onSubmit={handleSubmit}
          isSubmitting={submitLoading}
          onCancel={() => onOpenChange(false)}
          submitButtonText={submitButtonText}
        />
      </DialogContent>
    </Dialog>
  );
}
