
// Create a simple interface for document types
import { supabase } from "@/integrations/supabase/client";

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
      // This should query from Supabase once tables are created
      const { data, error } = await supabase
        .from('incomes')
        .select('*')
        .eq('monthYear', monthYear);
      
      if (error) {
        console.error("Error fetching incomes:", error);
        return [];
      }
      
      // For now, just return empty array or mock data
      return data || [];
    } catch (err) {
      console.error("Exception fetching incomes:", err);
      return [];
    }
  }
};

export const expenseApi = {
  getByMonth: async (monthYear: string): Promise<Expense[]> => {
    console.log(`Fetching expenses for ${monthYear}`);
    
    try {
      // This should query from Supabase once tables are created
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('monthYear', monthYear);
      
      if (error) {
        console.error("Error fetching expenses:", error);
        return [];
      }
      
      // For now, just return empty array or mock data
      return data || [];
    } catch (err) {
      console.error("Exception fetching expenses:", err);
      return [];
    }
  }
};
