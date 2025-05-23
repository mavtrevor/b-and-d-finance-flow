
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Income, incomeApi } from "@/lib/db";
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Plus } from "lucide-react";

const formSchema = z.object({
  date: z.string().min(1, { message: "Date is required" }),
  clientName: z.string().min(1, { message: "Client name is required" }),
  broughtBy: z.string().min(1, { message: "Brought by is required" }),
  primaryAmount: z.coerce.number().min(1, { message: "Primary amount is required" }),
  cautionFee: z.coerce.number().optional(),
  commission: z.coerce.number().min(0, { message: "Commission is required" }),
});

type IncomeFormValues = z.infer<typeof formSchema>;

export function Income() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      clientName: "",
      broughtBy: "",
      primaryAmount: 0,
      cautionFee: 0,
      commission: 0,
    },
  });

  useEffect(() => {
    if (currentMonth && currentUser) {
      fetchIncomes();
    }
  }, [currentMonth, currentUser]);

  const fetchIncomes = async () => {
    setLoading(true);
    try {
      const data = await incomeApi.getByMonth(currentMonth);
      setIncomes(data);
    } catch (error) {
      console.error("Error fetching incomes:", error);
      toast({
        variant: "destructive",
        title: "Failed to load incomes",
        description: "There was a problem loading the income data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
  };

  const onSubmit = async (values: IncomeFormValues) => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to add income entries.",
      });
      return;
    }

    try {
      const primaryAmount = Number(values.primaryAmount);
      const cautionFee = values.cautionFee ? Number(values.cautionFee) : 0;
      const commission = Number(values.commission);
      const netIncome = primaryAmount + cautionFee - commission;

      const incomeData: Omit<Income, 'id' | 'createdAt' | 'updatedAt'> = {
        date: new Date(values.date),
        clientName: values.clientName,
        broughtBy: values.broughtBy,
        primaryAmount,
        cautionFee,
        commission,
        netIncome,
        monthYear: currentMonth
      };

      const result = await incomeApi.add(incomeData, currentUser);
      
      if (result) {
        toast({
          title: "Income added successfully",
          description: `Income for ${values.clientName} has been added.`,
        });
        fetchIncomes();
        setIsDialogOpen(false);
        form.reset();
      } else {
        throw new Error("Failed to add income");
      }
    } catch (error) {
      console.error("Error adding income:", error);
      toast({
        variant: "destructive",
        title: "Failed to add income",
        description: "There was a problem adding the income entry.",
      });
    }
  };

  const calculateNetIncome = () => {
    const primaryAmount = form.watch("primaryAmount") || 0;
    const cautionFee = form.watch("cautionFee") || 0;
    const commission = form.watch("commission") || 0;
    return primaryAmount + cautionFee - commission;
  };

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Income Management"
        description="Track and manage all income entries"
        showMonthSelector
        onMonthChange={handleMonthChange}
        initialMonth={currentMonth}
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Income
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Income</DialogTitle>
                <DialogDescription>
                  Enter the details for the new income entry.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      name="clientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter client name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="broughtBy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brought By</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter brought by" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="primaryAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                form.trigger(["primaryAmount", "commission", "cautionFee"]);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cautionFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Caution Fee (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e.target.value === "" ? undefined : Number(e.target.value));
                                form.trigger(["primaryAmount", "commission", "cautionFee"]);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="commission"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Commission</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                form.trigger(["primaryAmount", "commission", "cautionFee"]);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="border rounded p-3 bg-muted/30">
                    <div className="text-sm font-medium">Net Income</div>
                    <div className="text-2xl font-bold">
                      {new Intl.NumberFormat('en-NG', { 
                        style: 'currency', 
                        currency: 'NGN',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0 
                      }).format(calculateNetIncome())}
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Income</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Income Entries</CardTitle>
          <CardDescription>View and manage all income records</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : incomes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No income entries found for this month.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Brought By</TableHead>
                    <TableHead className="text-right">Primary Amount</TableHead>
                    <TableHead className="text-right">Caution Fee</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                    <TableHead className="text-right">Net Income</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomes.map((income) => (
                    <TableRow key={income.id}>
                      <TableCell>{new Date(income.date).toLocaleDateString()}</TableCell>
                      <TableCell>{income.clientName}</TableCell>
                      <TableCell>{income.broughtBy}</TableCell>
                      <TableCell className="text-right">{new Intl.NumberFormat('en-NG', { 
                        style: 'currency', 
                        currency: 'NGN',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0 
                      }).format(income.primaryAmount)}</TableCell>
                      <TableCell className="text-right">{income.cautionFee ? new Intl.NumberFormat('en-NG', { 
                        style: 'currency', 
                        currency: 'NGN',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0 
                      }).format(income.cautionFee) : '-'}</TableCell>
                      <TableCell className="text-right">{new Intl.NumberFormat('en-NG', { 
                        style: 'currency', 
                        currency: 'NGN',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0 
                      }).format(income.commission)}</TableCell>
                      <TableCell className="text-right font-medium">{new Intl.NumberFormat('en-NG', { 
                        style: 'currency', 
                        currency: 'NGN',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0 
                      }).format(income.netIncome)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <div>
            <span className="text-sm text-muted-foreground">Total Entries: {incomes.length}</span>
          </div>
          <div>
            <span className="font-medium">
              Total Net Income: {new Intl.NumberFormat('en-NG', { 
                style: 'currency', 
                currency: 'NGN',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0 
              }).format(incomes.reduce((sum, income) => sum + income.netIncome, 0))}
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
