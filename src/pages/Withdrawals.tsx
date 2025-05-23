
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Wallet, Plus, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { SummaryCard } from "@/components/ui/summary-card";
import { partnerApi, Withdrawal, withdrawalApi } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/utils/formatters";

const formSchema = z.object({
  date: z.string().min(1, { message: "Date is required" }),
  amount: z.coerce.number().min(1, { message: "Amount is required" }),
  recipient: z.string().min(1, { message: "Recipient is required" }),
  description: z.string().optional(),
});

type WithdrawalFormValues = z.infer<typeof formSchema>;

export function Withdrawals() {
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [withdrawalsThisMonth, setWithdrawalsThisMonth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentWithdrawal, setCurrentWithdrawal] = useState<Withdrawal | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      recipient: "",
      description: "",
    },
  });

  useEffect(() => {
    fetchBalances();
    fetchWithdrawals();
  }, [currentMonth]);

  useEffect(() => {
    // When in edit mode and a withdrawal is selected, update the form values
    if (isEditMode && currentWithdrawal) {
      form.reset({
        date: currentWithdrawal.date.toISOString().split('T')[0],
        amount: Number(currentWithdrawal.amount),
        recipient: currentWithdrawal.recipient,
        description: currentWithdrawal.description || "",
      });
    } else {
      // Reset form to default values when not in edit mode
      form.reset({
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        recipient: "",
        description: "",
      });
    }
  }, [isEditMode, currentWithdrawal, form]);

  const fetchBalances = async () => {
    setLoading(true);
    try {
      const totalAvailable = await partnerApi.getTotalAvailableBalance();
      setTotalBalance(totalAvailable);
      
      const monthWithdrawals = await withdrawalApi.getTotalWithdrawalsByMonth(currentMonth);
      setWithdrawalsThisMonth(monthWithdrawals);
    } catch (error) {
      console.error("Error fetching balances:", error);
      toast({
        variant: "destructive",
        title: "Failed to load balances",
        description: "There was a problem loading the balance data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const withdrawalData = await withdrawalApi.getByMonth(currentMonth);
      setWithdrawals(withdrawalData);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      toast({
        variant: "destructive",
        title: "Failed to load withdrawals",
        description: "There was a problem loading the withdrawal data.",
      });
    }
  };

  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
  };

  const handleEditWithdrawal = (withdrawal: Withdrawal) => {
    setCurrentWithdrawal(withdrawal);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDeleteWithdrawal = (withdrawal: Withdrawal) => {
    setCurrentWithdrawal(withdrawal);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteWithdrawal = async () => {
    if (!currentUser || !currentWithdrawal) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to delete a withdrawal.",
      });
      return;
    }

    setDeleteLoading(true);
    try {
      const success = await withdrawalApi.delete(currentWithdrawal.id!, currentUser);
      
      if (success) {
        toast({
          title: "Withdrawal Deleted",
          description: `Successfully deleted withdrawal of ${formatCurrency(Number(currentWithdrawal.amount))}`,
        });
        
        // Reload data
        fetchBalances();
        fetchWithdrawals();
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
      setIsDeleteDialogOpen(false);
      setCurrentWithdrawal(null);
    }
  };

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
      
      // Reload data
      fetchBalances();
      fetchWithdrawals();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setCurrentWithdrawal(null);
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

  const remainingBalance = totalBalance;
  const recipients = ["Desmond", "Bethel"];
  
  // Dialog title and button text based on mode
  const dialogTitle = isEditMode ? "Edit Withdrawal" : "Record Withdrawal";
  const dialogDescription = isEditMode 
    ? "Update the details for this partner withdrawal." 
    : "Enter the details for this partner withdrawal.";
  const submitButtonText = isEditMode ? "Update Withdrawal" : "Record Withdrawal";

  return (
    <div className="w-full max-w-full">
      <PageHeader
        title="Withdrawals"
        description="Manage partner withdrawals"
        showMonthSelector
        onMonthChange={handleMonthChange}
        initialMonth={currentMonth}
        actions={
          <Button onClick={() => {
            setIsEditMode(false);
            setCurrentWithdrawal(null);
            setIsDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" /> Record Withdrawal
          </Button>
        }
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <SummaryCard 
          title="Total Available Balance" 
          value={totalBalance} 
          icon={<Wallet className="h-4 w-4" />}
          loading={loading}
        />
        <SummaryCard 
          title="Withdrawals This Month" 
          value={withdrawalsThisMonth}
          loading={loading}
        />
        <SummaryCard 
          title="Remaining Balance" 
          value={remainingBalance}
          loading={loading}
        />
      </div>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
          <CardDescription>Partner withdrawal records</CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell>{formatDate(withdrawal.date)}</TableCell>
                    <TableCell>{withdrawal.recipient}</TableCell>
                    <TableCell>{formatCurrency(Number(withdrawal.amount))}</TableCell>
                    <TableCell>{withdrawal.description || "-"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditWithdrawal(withdrawal)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteWithdrawal(withdrawal)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Wallet className="mx-auto h-12 w-12 opacity-30 mb-3" />
              <h3 className="text-lg font-medium mb-2">No Withdrawal Records</h3>
              <p className="text-sm">No withdrawals have been recorded for {new Date(currentMonth + "-01").toLocaleString('default', { month: 'long', year: 'numeric' })}.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Withdrawal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsEditMode(false);
          setCurrentWithdrawal(null);
        }
        setIsDialogOpen(open);
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
                  onClick={() => {
                    setIsDialogOpen(false);
                    setIsEditMode(false);
                    setCurrentWithdrawal(null);
                  }} 
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this withdrawal? This action cannot be undone.
              {currentWithdrawal && (
                <div className="mt-4 p-3 border rounded-md bg-muted/50">
                  <p><span className="font-medium">Date:</span> {formatDate(currentWithdrawal.date)}</p>
                  <p><span className="font-medium">Recipient:</span> {currentWithdrawal.recipient}</p>
                  <p><span className="font-medium">Amount:</span> {formatCurrency(Number(currentWithdrawal.amount))}</p>
                  {currentWithdrawal.description && (
                    <p><span className="font-medium">Description:</span> {currentWithdrawal.description}</p>
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
    </div>
  );
}
