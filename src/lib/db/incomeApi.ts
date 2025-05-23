
import { supabase } from "@/integrations/supabase/client";
import { Income } from "./types";
import { formatMonthYear } from "./utils";
import { User } from "@supabase/supabase-js";

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
