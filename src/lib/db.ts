
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

export interface Withdrawal extends BaseDocument {
  date: Date;
  amount: number;
  recipient: string;
  description?: string;
}

export interface Partner {
  id: string;
  name: string;
  share: number;
  balance: number;
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
        .eq('monthyear', monthYear);
      
      if (error) {
        console.error("Error fetching incomes:", error);
        return [];
      }
      
      // Transform from DB format to our interface
      return data ? data.map(item => ({
        id: item.id,
        date: new Date(item.date),
        clientName: item.clientname,
        broughtBy: item.broughtby,
        primaryAmount: item.primaryamount,
        cautionFee: item.cautionfee,
        commission: item.commission,
        netIncome: item.netincome,
        monthYear: item.monthyear,
        createdAt: item.createdat ? new Date(item.createdat) : undefined,
        updatedAt: item.updatedat ? new Date(item.updatedat) : undefined
      })) : [];
      
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
      
      // Transform to DB format
      const dbIncome = {
        clientname: income.clientName,
        broughtby: income.broughtBy,
        primaryamount: income.primaryAmount,
        cautionfee: income.cautionFee,
        commission: income.commission,
        netincome: income.netIncome,
        date: income.date.toISOString(),
        monthyear: monthYear,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('incomes')
        .insert([dbIncome])
        .select();
      
      if (error) {
        console.error("Error adding income:", error);
        return null;
      }
      
      if (data && data.length > 0) {
        // Transform back to our interface
        return {
          id: data[0].id,
          date: new Date(data[0].date),
          clientName: data[0].clientname,
          broughtBy: data[0].broughtby,
          primaryAmount: data[0].primaryamount,
          cautionFee: data[0].cautionfee,
          commission: data[0].commission,
          netIncome: data[0].netincome,
          monthYear: data[0].monthyear,
          createdAt: data[0].createdat ? new Date(data[0].createdat) : undefined,
          updatedAt: data[0].updatedat ? new Date(data[0].updatedat) : undefined
        };
      }
      
      return null;
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
        .eq('monthyear', monthYear);
      
      if (error) {
        console.error("Error fetching expenses:", error);
        return [];
      }
      
      // Transform from DB format to our interface
      return data ? data.map(item => ({
        id: item.id,
        date: new Date(item.date),
        name: item.name,
        category: item.category,
        amount: item.amount,
        notes: item.notes,
        monthYear: item.monthyear,
        createdAt: item.createdat ? new Date(item.createdat) : undefined,
        updatedAt: item.updatedat ? new Date(item.updatedat) : undefined
      })) : [];
      
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
      
      // Transform to DB format
      const dbExpense = {
        name: expense.name,
        category: expense.category,
        amount: expense.amount,
        notes: expense.notes,
        date: expense.date.toISOString(),
        monthyear: monthYear,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('expenses')
        .insert([dbExpense])
        .select();
      
      if (error) {
        console.error("Error adding expense:", error);
        return null;
      }
      
      if (data && data.length > 0) {
        // Transform back to our interface
        return {
          id: data[0].id,
          date: new Date(data[0].date),
          name: data[0].name,
          category: data[0].category,
          amount: data[0].amount,
          notes: data[0].notes,
          monthYear: data[0].monthyear,
          createdAt: data[0].createdat ? new Date(data[0].createdat) : undefined,
          updatedAt: data[0].updatedat ? new Date(data[0].updatedat) : undefined
        };
      }
      
      return null;
    } catch (err) {
      console.error("Exception adding expense:", err);
      return null;
    }
  }
};

// Create withdrawals API
export const withdrawalApi = {
  getByMonth: async (monthYear: string): Promise<Withdrawal[]> => {
    // Placeholder - will be implemented when you create the withdrawals table
    console.log(`Fetching withdrawals for ${monthYear}`);
    return [];
  },

  add: async (withdrawal: Omit<Withdrawal, 'id' | 'createdAt' | 'updatedAt'>, user: User): Promise<Withdrawal | null> => {
    // Placeholder - will be implemented when you create the withdrawals table
    console.log("Adding withdrawal:", withdrawal);
    return null;
  }
};

// Create partner API 
export const partnerApi = {
  getAll: async (): Promise<Partner[]> => {
    // Placeholder - will be implemented when you create the partners table
    return [];
  }
};
