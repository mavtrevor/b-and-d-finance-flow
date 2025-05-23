
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Expense, expenseApi } from "@/lib/db";
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
import { Plus } from "lucide-react";

const formSchema = z.object({
  date: z.string().min(1, { message: "Date is required" }),
  name: z.string().min(1, { message: "Name is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  amount: z.coerce.number().min(1, { message: "Amount is required" }),
  notes: z.string().optional(),
});

const expenseCategories = [
  "Utilities",
  "Maintenance",
  "Repairs",
  "Supplies",
  "Staff Salary",
  "Rent",
  "Taxes",
  "Insurance",
  "Marketing",
  "Other"
];

type ExpenseFormValues = z.infer<typeof formSchema>;

export function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      name: "",
      category: "",
      amount: 0,
      notes: "",
    },
  });

  useEffect(() => {
    if (currentMonth && currentUser) {
      fetchExpenses();
    }
  }, [currentMonth, currentUser]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const data = await expenseApi.getByMonth(currentMonth);
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast({
        variant: "destructive",
        title: "Failed to load expenses",
        description: "There was a problem loading the expense data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
  };

  const onSubmit = async (values: ExpenseFormValues) => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to add expense entries.",
      });
      return;
    }

    try {
      const expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> = {
        date: new Date(values.date),
        name: values.name,
        category: values.category,
        amount: Number(values.amount),
        notes: values.notes,
        monthYear: currentMonth
      };

      const result = await expenseApi.add(expenseData, currentUser);
      
      if (result) {
        toast({
          title: "Expense added successfully",
          description: `Expense for ${values.name} has been added.`,
        });
        fetchExpenses();
        setIsDialogOpen(false);
        form.reset();
      } else {
        throw new Error("Failed to add expense");
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      toast({
        variant: "destructive",
        title: "Failed to add expense",
        description: "There was a problem adding the expense entry.",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Expense Management"
        description="Track and manage all expense entries"
        showMonthSelector
        onMonthChange={handleMonthChange}
        initialMonth={currentMonth}
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
                <DialogDescription>
                  Enter the details for the new expense entry.
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
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name/Description</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter expense name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {expenseCategories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Additional notes about this expense" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Expense</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Expense Entries</CardTitle>
          <CardDescription>View and manage all expense records</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No expense entries found for this month.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                      <TableCell>{expense.name}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell className="text-right">{new Intl.NumberFormat('en-NG', { 
                        style: 'currency', 
                        currency: 'NGN',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0 
                      }).format(expense.amount)}</TableCell>
                      <TableCell>{expense.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <div>
            <span className="text-sm text-muted-foreground">Total Entries: {expenses.length}</span>
          </div>
          <div>
            <span className="font-medium">
              Total Expenses: {new Intl.NumberFormat('en-NG', { 
                style: 'currency', 
                currency: 'NGN',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0 
              }).format(expenses.reduce((sum, expense) => sum + expense.amount, 0))}
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
