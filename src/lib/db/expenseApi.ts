
import { supabase } from "@/integrations/supabase/client";
import { Expense } from "./types";
import { formatMonthYear } from "./utils";
import { User } from "@supabase/supabase-js";

export const expenseApi = {
  getByMonth: async (monthYear: string): Promise<Expense[]> => {
    console.log(`Fetching expenses for ${monthYear}`);
    
    try {
      // Query from Supabase - removed user filtering to show all data
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
  },

  update: async (id: string, expense: Partial<Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>>, user: User): Promise<Expense | null> => {
    try {
      // Transform to DB format
      const dbExpense: Record<string, any> = {};
      
      if (expense.name !== undefined) dbExpense.name = expense.name;
      if (expense.category !== undefined) dbExpense.category = expense.category;
      if (expense.amount !== undefined) dbExpense.amount = expense.amount;
      if (expense.notes !== undefined) dbExpense.notes = expense.notes;
      if (expense.date !== undefined) dbExpense.date = expense.date.toISOString();
      
      // Removed user_id filtering - allow editing any record
      const { data, error } = await supabase
        .from('expenses')
        .update(dbExpense)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error("Error updating expense:", error);
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
      console.error("Exception updating expense:", err);
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      // Removed user_id filtering - allow deleting any record
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting expense:", error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error("Exception deleting expense:", err);
      return false;
    }
  }
};
