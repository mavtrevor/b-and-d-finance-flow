
import { supabase } from "@/integrations/supabase/client";
import { Partner } from "./types";
import { withdrawalApi } from "./withdrawalApi";

export const partnerApi = {
  getAll: async (): Promise<Partner[]> => {
    // Get the fixed partners data
    const partners = [
      { id: '1', name: 'Desmond', share: 50, balance: 0, withdrawals: 0 },
      { id: '2', name: 'Bethel', share: 50, balance: 0, withdrawals: 0 },
    ];

    // Calculate balances based on income, expenses and withdrawals
    try {
      // Get all income data
      const { data: incomeData, error: incomeError } = await supabase
        .from('incomes')
        .select('netincome');

      if (incomeError) {
        console.error("Error fetching income totals:", incomeError);
        return partners;
      }

      // Get all expense data
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .select('amount');

      if (expenseError) {
        console.error("Error fetching expense totals:", expenseError);
        return partners;
      }

      // Calculate the total income
      const totalIncome = incomeData.reduce((sum, item) => sum + (item.netincome || 0), 0);
      
      // Calculate the total expenses
      const totalExpenses = expenseData.reduce((sum, item) => sum + (item.amount || 0), 0);
      
      // Calculate Net Operating Profit
      const netOperatingProfit = Math.max(0, totalIncome - totalExpenses);
      
      // Calculate each partner's individual withdrawals and share
      for (let i = 0; i < partners.length; i++) {
        // Get total withdrawals for this partner
        partners[i].withdrawals = await withdrawalApi.getTotalWithdrawalsByPartner(partners[i].name);
        
        // Calculate the partner's share of the net operating profit
        const partnerShare = netOperatingProfit * (partners[i].share / 100);
        
        // Calculate the partner's remaining balance (share minus withdrawals)
        partners[i].balance = Math.max(0, partnerShare - partners[i].withdrawals);
      }

      return partners;
    } catch (err) {
      console.error("Exception calculating partner balances:", err);
      return partners;
    }
  },
  
  getTotalAvailableBalance: async (): Promise<number> => {
    try {
      // Get all income data
      const { data: incomeData, error: incomeError } = await supabase
        .from('incomes')
        .select('netincome');

      if (incomeError) {
        console.error("Error fetching income totals:", incomeError);
        return 0;
      }
      
      // Get all expense data
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .select('amount');

      if (expenseError) {
        console.error("Error fetching expense totals:", expenseError);
        return 0;
      }

      // Calculate the total income
      const totalIncome = incomeData.reduce((sum, item) => sum + (item.netincome || 0), 0);
      
      // Calculate the total expenses
      const totalExpenses = expenseData.reduce((sum, item) => sum + (item.amount || 0), 0);
      
      // Calculate Net Operating Profit
      const netOperatingProfit = Math.max(0, totalIncome - totalExpenses);
      
      // Get total withdrawals
      const totalWithdrawals = await withdrawalApi.getTotalWithdrawals();
      
      // Return available balance (net profit minus withdrawals)
      return Math.max(0, netOperatingProfit - totalWithdrawals);
    } catch (err) {
      console.error("Exception calculating total available balance:", err);
      return 0;
    }
  },
  
  getNetOperatingProfit: async (): Promise<number> => {
    try {
      // Get all income data
      const { data: incomeData, error: incomeError } = await supabase
        .from('incomes')
        .select('netincome');

      if (incomeError) {
        console.error("Error fetching income totals:", incomeError);
        return 0;
      }
      
      // Get all expense data
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .select('amount');

      if (expenseError) {
        console.error("Error fetching expense totals:", expenseError);
        return 0;
      }

      // Calculate the total income
      const totalIncome = incomeData.reduce((sum, item) => sum + (item.netincome || 0), 0);
      
      // Calculate the total expenses
      const totalExpenses = expenseData.reduce((sum, item) => sum + (item.amount || 0), 0);
      
      // Return Net Operating Profit
      return Math.max(0, totalIncome - totalExpenses);
    } catch (err) {
      console.error("Exception calculating net operating profit:", err);
      return 0;
    }
  },
  
  getManagerCommission: async (monthYear: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('incomes')
        .select('commission')
        .eq('monthyear', monthYear);
      
      if (error) {
        console.error("Error fetching manager commission:", error);
        return 0;
      }
      
      // Sum up all commission values for the month
      return data ? data.reduce((sum, item) => sum + (item.commission || 0), 0) : 0;
    } catch (err) {
      console.error("Exception fetching manager commission:", err);
      return 0;
    }
  }
};
