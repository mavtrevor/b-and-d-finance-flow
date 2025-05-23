
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
  withdrawals: number;
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
  },

  // Update an income entry
  update: async (id: string, income: Partial<Omit<Income, 'id' | 'createdAt' | 'updatedAt'>>, user: User): Promise<Income | null> => {
    try {
      // Transform to DB format
      const dbIncome: Record<string, any> = {};
      
      if (income.clientName !== undefined) dbIncome.clientname = income.clientName;
      if (income.broughtBy !== undefined) dbIncome.broughtby = income.broughtBy;
      if (income.primaryAmount !== undefined) dbIncome.primaryamount = income.primaryAmount;
      if (income.cautionFee !== undefined) dbIncome.cautionfee = income.cautionFee;
      if (income.commission !== undefined) dbIncome.commission = income.commission;
      if (income.netIncome !== undefined) dbIncome.netincome = income.netIncome;
      if (income.date !== undefined) dbIncome.date = income.date.toISOString();
      
      const { data, error } = await supabase
        .from('incomes')
        .update(dbIncome)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error("Error updating income:", error);
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
      console.error("Exception updating income:", err);
      return null;
    }
  },

  // Delete an income entry
  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('incomes')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting income:", error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error("Exception deleting income:", err);
      return false;
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
  },

  // Update an expense entry
  update: async (id: string, expense: Partial<Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>>, user: User): Promise<Expense | null> => {
    try {
      // Transform to DB format
      const dbExpense: Record<string, any> = {};
      
      if (expense.name !== undefined) dbExpense.name = expense.name;
      if (expense.category !== undefined) dbExpense.category = expense.category;
      if (expense.amount !== undefined) dbExpense.amount = expense.amount;
      if (expense.notes !== undefined) dbExpense.notes = expense.notes;
      if (expense.date !== undefined) dbExpense.date = expense.date.toISOString();
      
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

  // Delete an expense entry
  delete: async (id: string): Promise<boolean> => {
    try {
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

// Create withdrawals API
export const withdrawalApi = {
  getByMonth: async (monthYear: string): Promise<Withdrawal[]> => {
    console.log(`Fetching withdrawals for ${monthYear}`);
    
    try {
      // Query from Supabase
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('monthyear', monthYear);
      
      if (error) {
        console.error("Error fetching withdrawals:", error);
        return [];
      }
      
      // Transform from DB format to our interface
      return data ? data.map(item => ({
        id: item.id,
        date: new Date(item.date),
        recipient: item.recipient,
        amount: item.amount,
        description: item.description,
        monthYear: item.monthyear,
        createdAt: item.createdat ? new Date(item.createdat) : undefined,
        updatedAt: item.updatedat ? new Date(item.updatedat) : undefined
      })) : [];
      
    } catch (err) {
      console.error("Exception fetching withdrawals:", err);
      return [];
    }
  },

  add: async (withdrawal: Omit<Withdrawal, 'id' | 'createdAt' | 'updatedAt'>, user: User): Promise<Withdrawal | null> => {
    try {
      // Format date for monthYear field if not provided
      const monthYear = withdrawal.monthYear || formatMonthYear(new Date(withdrawal.date));
      
      // Transform to DB format
      const dbWithdrawal = {
        date: withdrawal.date.toISOString(),
        amount: withdrawal.amount,
        recipient: withdrawal.recipient,
        description: withdrawal.description,
        monthyear: monthYear,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('withdrawals')
        .insert([dbWithdrawal])
        .select();
      
      if (error) {
        console.error("Error adding withdrawal:", error);
        return null;
      }
      
      if (data && data.length > 0) {
        // Transform back to our interface
        return {
          id: data[0].id,
          date: new Date(data[0].date),
          amount: data[0].amount,
          recipient: data[0].recipient,
          description: data[0].description,
          monthYear: data[0].monthyear,
          createdAt: data[0].createdat ? new Date(data[0].createdat) : undefined,
          updatedAt: data[0].updatedat ? new Date(data[0].updatedat) : undefined
        };
      }
      
      return null;
    } catch (err) {
      console.error("Exception adding withdrawal:", err);
      return null;
    }
  },
  
  getTotalWithdrawals: async (): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('amount');
      
      if (error) {
        console.error("Error fetching total withdrawals:", error);
        return 0;
      }
      
      return data ? data.reduce((sum, item) => sum + Number(item.amount), 0) : 0;
    } catch (err) {
      console.error("Exception fetching total withdrawals:", err);
      return 0;
    }
  },
  
  getTotalWithdrawalsByMonth: async (monthYear: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('amount')
        .eq('monthyear', monthYear);
      
      if (error) {
        console.error(`Error fetching total withdrawals for ${monthYear}:`, error);
        return 0;
      }
      
      return data ? data.reduce((sum, item) => sum + Number(item.amount), 0) : 0;
    } catch (err) {
      console.error(`Exception fetching total withdrawals for ${monthYear}:`, err);
      return 0;
    }
  },
  
  // New function to get withdrawals by partner name
  getTotalWithdrawalsByPartner: async (partnerName: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('amount')
        .eq('recipient', partnerName);
      
      if (error) {
        console.error(`Error fetching withdrawals for partner ${partnerName}:`, error);
        return 0;
      }
      
      return data ? data.reduce((sum, item) => sum + Number(item.amount), 0) : 0;
    } catch (err) {
      console.error(`Exception fetching withdrawals for partner ${partnerName}:`, err);
      return 0;
    }
  }
};

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
  
  // Add method to get Net Operating Profit
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
  
  // Add method to get manager's commission for current month
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
