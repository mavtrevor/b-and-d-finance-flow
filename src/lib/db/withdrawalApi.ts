
import { supabase } from "@/integrations/supabase/client";
import { Withdrawal } from "./types";
import { formatMonthYear } from "./utils";
import { User } from "@supabase/supabase-js";

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
