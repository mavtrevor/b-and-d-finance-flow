
// Create a simple interface for document types
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export interface BaseDocument {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  monthYear?: string;
}

export interface Income extends BaseDocument {
  date: Date;
  clientName: string;
  broughtBy: string;
  primaryAmount: number;
  cautionFee?: number;
  commission: number;
  netIncome: number;
}

export interface Expense extends BaseDocument {
  date: Date;
  name: string;
  category: string;
  amount: number;
  notes?: string;
}

// Format date to YYYY-MM for monthYear filter
const formatMonthYear = (date: Date): string => {
  return date.toISOString().substring(0, 7);
};

// Simple API for income and expenses
export const incomeApi = {
  getByMonth: async (monthYear: string): Promise<Income[]> => {
    console.log(`Fetching incomes for ${monthYear}`);
    
    try {
      // Query from Supabase
      const { data, error } = await supabase
        .from('incomes')
        .select('*')
        .eq('monthYear', monthYear);
      
      if (error) {
        console.error("Error fetching incomes:", error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error("Exception fetching incomes:", err);
      return [];
    }
  },

  // Add an income entry
  add: async (income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>, user: User): Promise<Income | null> => {
    try {
      // Format date for monthYear field if not provided
      const monthYear = income.monthYear || formatMonthYear(new Date(income.date));
      
      const { data, error } = await supabase.from('incomes').insert([{
        ...income,
        monthYear,
        user_id: user.id
      }]).select();
      
      if (error) {
        console.error("Error adding income:", error);
        return null;
      }
      
      return data?.[0] || null;
    } catch (err) {
      console.error("Exception adding income:", err);
      return null;
    }
  }
};

export const expenseApi = {
  getByMonth: async (monthYear: string): Promise<Expense[]> => {
    console.log(`Fetching expenses for ${monthYear}`);
    
    try {
      // Query from Supabase
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('monthYear', monthYear);
      
      if (error) {
        console.error("Error fetching expenses:", error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error("Exception fetching expenses:", err);
      return [];
    }
  },

  // Add an expense entry
  add: async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>, user: User): Promise<Expense | null> => {
    try {
      // Format date for monthYear field if not provided
      const monthYear = expense.monthYear || formatMonthYear(new Date(expense.date));
      
      const { data, error } = await supabase.from('expenses').insert([{
        ...expense,
        monthYear,
        user_id: user.id
      }]).select();
      
      if (error) {
        console.error("Error adding expense:", error);
        return null;
      }
      
      return data?.[0] || null;
    } catch (err) {
      console.error("Exception adding expense:", err);
      return null;
    }
  }
};
