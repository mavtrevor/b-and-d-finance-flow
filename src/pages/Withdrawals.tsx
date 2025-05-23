
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Wallet, Plus } from "lucide-react";
import { SummaryCard } from "@/components/ui/summary-card";
import { partnerApi } from "@/lib/db";

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
  const [totalBalance, setTotalBalance] = useState(0);
  const [withdrawalsThisMonth, setWithdrawalsThisMonth] = useState(0);
  const [loading, setLoading] = useState(true);
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
  }, [currentMonth]);

  const fetchBalances = async () => {
    setLoading(true);
    try {
      const totalAvailable = await partnerApi.getTotalAvailableBalance();
      setTotalBalance(totalAvailable);
      // For now, set withdrawals this month to 0 since we don't have a withdrawals table
      setWithdrawalsThisMonth(0);
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

  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
  };

  const onSubmit = async (values: WithdrawalFormValues) => {
    toast({
      title: "Coming Soon",
      description: "Withdrawal recording feature will be implemented in the next phase.",
    });
    setIsDialogOpen(false);
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { 
      style: 'currency', 
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const remainingBalance = totalBalance - withdrawalsThisMonth;
  const recipients = ["Desmond", "Bethel"];

  return (
    <div className="w-full max-w-full">
      <PageHeader
        title="Withdrawals"
        description="Manage partner withdrawals"
        showMonthSelector
        onMonthChange={handleMonthChange}
        initialMonth={currentMonth}
        actions={
          <Button onClick={() => setIsDialogOpen(true)}>
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
          <div className="text-center py-12 text-muted-foreground">
            <Wallet className="mx-auto h-12 w-12 opacity-30 mb-3" />
            <h3 className="text-lg font-medium mb-2">No Withdrawal Records</h3>
            <p className="text-sm">This feature will be implemented in the next phase.</p>
            <p className="text-sm">You'll need to create the withdrawals table in the database first.</p>
          </div>
        </CardContent>
      </Card>

      {/* Record Withdrawal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Record Withdrawal</DialogTitle>
            <DialogDescription>
              Enter the details for this partner withdrawal.
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
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Record Withdrawal</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
