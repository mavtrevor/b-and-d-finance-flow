
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense } from "@/lib/db";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface DashboardChartsProps {
  totalIncome: number;
  totalCommission: number;
  totalExpenses: number;
  expenses: Expense[];
  loading: boolean;
}

export function DashboardCharts({
  totalIncome,
  totalCommission,
  totalExpenses,
  expenses,
  loading
}: DashboardChartsProps) {
  // Prepare data for charts
  const incomeVsExpenseData = [
    { name: "Income", amount: totalIncome },
    { name: "Expenses", amount: totalExpenses + totalCommission },
  ];

  // Group expenses by category for pie chart
  const expensesByCategory = expenses.reduce((acc, expense) => {
    const category = expense.category || "Other";
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const expensePieData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  // Colors for pie chart
  const COLORS = ["#2D6A4F", "#52B788", "#95D5B2", "#D8F3DC", "#DDA15E", "#BC6C25"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Income vs Expense Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Income vs Expenses</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-pulse bg-gray-200 w-full h-4/5 rounded"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={incomeVsExpenseData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("en-NG", {
                      notation: "compact",
                      compactDisplay: "short",
                    }).format(value)
                  }
                />
                <Tooltip
                  formatter={(value: number) =>
                    new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN",
                      minimumFractionDigits: 0,
                    }).format(value)
                  }
                />
                <Bar
                  dataKey="amount"
                  fill="#2D6A4F"
                  name="Amount"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Expense Categories Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Categories</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-pulse bg-gray-200 w-4/5 h-4/5 rounded-full"></div>
            </div>
          ) : expensePieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensePieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percent,
                  }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

                    return percent > 0.05 ? (
                      <text
                        x={x}
                        y={y}
                        fill="white"
                        textAnchor={x > cx ? "start" : "end"}
                        dominantBaseline="central"
                      >
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    ) : null;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expensePieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip
                  formatter={(value: number) =>
                    new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN",
                      minimumFractionDigits: 0,
                    }).format(value)
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No expense data available for this month
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
