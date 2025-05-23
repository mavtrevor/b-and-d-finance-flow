
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Withdrawal } from "../types";
import { formatMonthYear } from "../utils";
import { mapDbWithdrawalToModel } from "./withdrawalBaseApi";

export const withdrawalCrudApi = {
  getByMonth: async (monthYear: string): Promise<Withdrawal[]> => {
    console.log(`Fetching withdrawals for ${monthYear}`);
    
    try {
      // Query from Supabase - removed user filtering to show all data
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('monthyear', monthYear);
      
      if (error) {
        console.error("Error fetching withdrawals:", error);
        return [];
      }
      
      // Transform from DB format to our interface
      return data ? data.map(mapDbWithdrawalToModel) : [];
      
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
        return mapDbWithdrawalToModel(data[0]);
      }
      
      return null;
    } catch (err) {
      console.error("Exception adding withdrawal:", err);
      return null;
    }
  },
  
  update: async (id: string, withdrawalData: Partial<Withdrawal>, user: User): Promise<Withdrawal | null> => {
    try {
      // Prepare the update data
      const updateData: Record<string, any> = {};
      
      if (withdrawalData.date) {
        updateData.date = withdrawalData.date.toISOString();
      }
      
      if (withdrawalData.amount !== undefined) {
        updateData.amount = withdrawalData.amount;
      }
      
      if (withdrawalData.recipient !== undefined) {
        updateData.recipient = withdrawalData.recipient;
      }
      
      if (withdrawalData.description !== undefined) {
        updateData.description = withdrawalData.description;
      }
      
      // Always update the monthYear if date is changed
      if (withdrawalData.date) {
        updateData.monthyear = formatMonthYear(withdrawalData.date);
      }
      
      // Add updated timestamp
      updateData.updatedat = new Date().toISOString();

      // Removed user_id filtering - allow editing any record
      const { data, error } = await supabase
        .from('withdrawals')
        .update(updateData)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error("Error updating withdrawal:", error);
        return null;
      }
      
      if (data && data.length > 0) {
        return mapDbWithdrawalToModel(data[0]);
      }
      
      return null;
    } catch (err) {
      console.error("Exception updating withdrawal:", err);
      return null;
    }
  },
  
  delete: async (id: string, user: User): Promise<boolean> => {
    try {
      // Removed user_id filtering - allow deleting any record
      const { error } = await supabase
        .from('withdrawals')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting withdrawal:", error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error("Exception deleting withdrawal:", err);
      return false;
    }
  }
};
