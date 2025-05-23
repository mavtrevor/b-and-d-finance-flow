
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { incomeApi, expenseApi, Income, Expense } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import { SummaryCard } from "@/components/ui/summary-card";

// Colors for the pie chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export function Reports() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });
  
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (currentMonth && currentUser) {
      fetchData();
    }
  }, [currentMonth, currentUser]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [incomesData, expensesData] = await Promise.all([
        incomeApi.getByMonth(currentMonth),
        expenseApi.getByMonth(currentMonth)
      ]);
      
      setIncomes(incomesData);
      setExpenses(expensesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Failed to load data",
        description: "There was a problem loading the report data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
  };

  // Calculate totals
  const totalIncome = incomes.reduce((sum, income) => sum + income.netIncome, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  // Prepare data for the income/expense bar chart
  const dailyData: Record<string, { day: string, income: number, expense: number }> = {};
  
  // Process incomes
  incomes.forEach(income => {
    const day = new Date(income.date).toLocaleDateString();
    if (!dailyData[day]) {
      dailyData[day] = { day, income: 0, expense: 0 };
    }
    dailyData[day].income += income.netIncome;
  });
  
  // Process expenses
  expenses.forEach(expense => {
    const day = new Date(expense.date).toLocaleDateString();
    if (!dailyData[day]) {
      dailyData[day] = { day, income: 0, expense: 0 };
    }
    dailyData[day].expense += expense.amount;
  });
  
  const barChartData = Object.values(dailyData);

  // Prepare data for the expense categories pie chart
  const expensesByCategory: Record<string, number> = {};
  
  expenses.forEach(expense => {
    if (!expensesByCategory[expense.category]) {
      expensesByCategory[expense.category] = 0;
    }
    expensesByCategory[expense.category] += expense.amount;
  });
  
  const pieChartData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Financial Reports"
        description="View financial analytics and reports"
        showMonthSelector
        onMonthChange={handleMonthChange}
        initialMonth={currentMonth}
      />
      
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <SummaryCard 
          title="Total Income" 
          value={totalIncome} 
          icon={<ArrowDownLeft className="h-4 w-4" />} 
          loading={loading}
        />
        <SummaryCard 
          title="Total Expenses" 
          value={totalExpenses} 
          icon={<ArrowUpRight className="h-4 w-4" />} 
          loading={loading}
        />
        <SummaryCard 
          title="Net Profit" 
          value={netProfit} 
          icon={<Wallet className="h-4 w-4" />} 
          loading={loading}
        />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>Daily comparison for the current month</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center h-[300px] items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={barChartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => new Intl.NumberFormat('en-NG', { 
                      style: 'currency', 
                      currency: 'NGN',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0 
                    }).format(Number(value))}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" name="Income" />
                  <Bar dataKey="expense" fill="#ef4444" name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No data available for this month
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center h-[300px] items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => new Intl.NumberFormat('en-NG', { 
                      style: 'currency', 
                      currency: 'NGN',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0 
                    }).format(Number(value))}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No expense data available for this month
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
          <CardDescription>Financial overview for {new Date(`${currentMonth}-01`).toLocaleString('default', { month: 'long', year: 'numeric' })}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium mb-2">Income Statistics</h4>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Total Entries:</span>
                    <span>{incomes.length}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Highest Income:</span>
                    <span>{new Intl.NumberFormat('en-NG', { 
                      style: 'currency', 
                      currency: 'NGN',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0 
                    }).format(Math.max(...(incomes.length ? incomes.map(i => i.netIncome) : [0])))}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Average Income:</span>
                    <span>{new Intl.NumberFormat('en-NG', { 
                      style: 'currency', 
                      currency: 'NGN',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0 
                    }).format(incomes.length ? totalIncome / incomes.length : 0)}</span>
                  </li>
                  <li className="flex justify-between font-medium">
                    <span>Total Income:</span>
                    <span>{new Intl.NumberFormat('en-NG', { 
                      style: 'currency', 
                      currency: 'NGN',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0 
                    }).format(totalIncome)}</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Expense Statistics</h4>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Total Entries:</span>
                    <span>{expenses.length}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Highest Expense:</span>
                    <span>{new Intl.NumberFormat('en-NG', { 
                      style: 'currency', 
                      currency: 'NGN',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0 
                    }).format(Math.max(...(expenses.length ? expenses.map(e => e.amount) : [0])))}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Average Expense:</span>
                    <span>{new Intl.NumberFormat('en-NG', { 
                      style: 'currency', 
                      currency: 'NGN',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0 
                    }).format(expenses.length ? totalExpenses / expenses.length : 0)}</span>
                  </li>
                  <li className="flex justify-between font-medium">
                    <span>Total Expenses:</span>
                    <span>{new Intl.NumberFormat('en-NG', { 
                      style: 'currency', 
                      currency: 'NGN',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0 
                    }).format(totalExpenses)}</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
