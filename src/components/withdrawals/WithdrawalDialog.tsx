
import { useState } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/formatters";
import { Withdrawal, withdrawalApi } from "@/lib/db";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  date: z.string().min(1, { message: "Date is required" }),
  amount: z.coerce.number().min(1, { message: "Amount is required" }),
  recipient: z.string().min(1, { message: "Recipient is required" }),
  description: z.string().optional(),
});

export type WithdrawalFormValues = z.infer<typeof formSchema>;

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
  const recipients = ["Desmond", "Bethel"];
  
  // Dialog title and button text based on mode
  const dialogTitle = isEditMode ? "Edit Withdrawal" : "Record Withdrawal";
  const dialogDescription = isEditMode 
    ? "Update the details for this partner withdrawal." 
    : "Enter the details for this partner withdrawal.";
  const submitButtonText = isEditMode ? "Update Withdrawal" : "Record Withdrawal";

  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      recipient: "",
      description: "",
    },
  });

  // Reset form when withdrawal or edit mode changes
  useState(() => {
    if (isEditMode && currentWithdrawal) {
      form.reset({
        date: currentWithdrawal.date.toISOString().split('T')[0],
        amount: Number(currentWithdrawal.amount),
        recipient: currentWithdrawal.recipient,
        description: currentWithdrawal.description || "",
      });
    } else {
      form.reset({
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        recipient: "",
        description: "",
      });
    }
  });

  const onSubmit = async (values: WithdrawalFormValues) => {
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
      
      // Reset form and state
      form.reset({
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        recipient: "",
        description: "",
      });
      
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
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recipient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {recipients.map((recipient) => (
                        <SelectItem key={recipient} value={recipient}>
                          {recipient}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(form.watch("amount") || 0)}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Additional notes about this withdrawal" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                disabled={submitLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitLoading}>
                {submitLoading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground"></span>
                    {isEditMode ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  submitButtonText
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
