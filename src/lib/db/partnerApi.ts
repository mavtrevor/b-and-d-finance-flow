
import { supabase } from "@/integrations/supabase/client";
import { Partner } from "./types";

// For simplicity, we'll define partners as a static list
// In a real application, this could be stored in the database
const PARTNERS: Partner[] = [
  { id: "1", name: "Daniel", sharePercentage: 50 },
  { id: "2", name: "Benjamin", sharePercentage: 50 }
];

export const partnerApi = {
  getAll: async (): Promise<Partner[]> => {
    return PARTNERS;
  },

  getTotalAvailableBalance: async (): Promise<number> => {
    try {
      // Get total income - removed user filtering
      const { data: incomeData, error: incomeError } = await supabase
        .from('incomes')
        .select('netincome');
      
      if (incomeError) {
        console.error("Error fetching income data:", incomeError);
        return 0;
      }

      // Get total expenses - removed user filtering
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .select('amount');
      
      if (expenseError) {
        console.error("Error fetching expense data:", expenseError);
        return 0;
      }

      // Get total withdrawals - removed user filtering
      const { data: withdrawalData, error: withdrawalError } = await supabase
        .from('withdrawals')
        .select('amount');
      
      if (withdrawalError) {
        console.error("Error fetching withdrawal data:", withdrawalError);
        return 0;
      }

      const totalIncome = incomeData ? incomeData.reduce((sum, item) => sum + Number(item.netincome), 0) : 0;
      const totalExpenses = expenseData ? expenseData.reduce((sum, item) => sum + Number(item.amount), 0) : 0;
      const totalWithdrawals = withdrawalData ? withdrawalData.reduce((sum, item) => sum + Number(item.amount), 0) : 0;

      // Available balance = Total Income - Total Expenses - Total Withdrawals
      return totalIncome - totalExpenses - totalWithdrawals;
    } catch (err) {
      console.error("Exception calculating total available balance:", err);
      return 0;
    }
  },

  getManagerCommission: async (monthYear: string): Promise<number> => {
    try {
      // Get commission data for the month - removed user filtering
      const { data, error } = await supabase
        .from('incomes')
        .select('commission')
        .eq('monthyear', monthYear);
      
      if (error) {
        console.error("Error fetching commission data:", error);
        return 0;
      }
      
      return data ? data.reduce((total, income) => total + Number(income.commission), 0) : 0;
    } catch (err) {
      console.error("Exception fetching manager commission:", err);
      return 0;
    }
  },

  getNetOperatingProfit: async (): Promise<number> => {
    try {
      // Get total net income - removed user filtering
      const { data: incomeData, error: incomeError } = await supabase
        .from('incomes')
        .select('netincome');
      
      if (incomeError) {
        console.error("Error fetching income data:", incomeError);
        return 0;
      }

      // Get total expenses - removed user filtering
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .select('amount');
      
      if (expenseError) {
        console.error("Error fetching expense data:", expenseError);
        return 0;
      }

      const totalNetIncome = incomeData ? incomeData.reduce((sum, item) => sum + Number(item.netincome), 0) : 0;
      const totalExpenses = expenseData ? expenseData.reduce((sum, item) => sum + Number(item.amount), 0) : 0;

      // Net Operating Profit = Total Net Income - Total Expenses
      return totalNetIncome - totalExpenses;
    } catch (err) {
      console.error("Exception calculating net operating profit:", err);
      return 0;
    }
  }
};
