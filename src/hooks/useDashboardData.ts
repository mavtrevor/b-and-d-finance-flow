
import { useState, useEffect } from "react";
import { incomeApi, expenseApi, Expense, Income } from "@/lib/db";

export function useDashboardData(selectedMonth: string) {
  const [loading, setLoading] = useState<boolean>(true);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    console.log("Dashboard useEffect triggered with selectedMonth:", selectedMonth);
    
    if (!selectedMonth) {
      console.log("No selectedMonth, skipping data fetch");
      return;
    }

    const fetchData = async () => {
      console.log("Starting data fetch for month:", selectedMonth);
      setLoading(true);
      try {
        const [incomesData, expensesData] = await Promise.all([
          incomeApi.getByMonth(selectedMonth),
          expenseApi.getByMonth(selectedMonth),
        ]);
        
        console.log("Fetched incomes data:", incomesData);
        console.log("Fetched expenses data:", expensesData);
        
        setIncomes(incomesData);
        setExpenses(expensesData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth]);

  // Calculate summary data
  const totalIncome = incomes.reduce((sum, income) => sum + income.primaryAmount, 0);
  const totalCommission = incomes.reduce((sum, income) => sum + income.commission, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netOperatingProfit = totalIncome - totalCommission - totalExpenses;
  const partnerShare = netOperatingProfit / 2;

  console.log("Dashboard calculations:", {
    totalIncome,
    totalCommission,
    totalExpenses,
    netOperatingProfit,
    partnerShare,
    selectedMonth
  });

  return {
    loading,
    incomes,
    expenses,
    totalIncome,
    totalCommission,
    totalExpenses,
    netOperatingProfit,
    partnerShare
  };
}
