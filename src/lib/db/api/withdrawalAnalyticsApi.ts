
import { supabase } from "@/integrations/supabase/client";

export const withdrawalAnalyticsApi = {
  getTotalWithdrawals: async (): Promise<number> => {
    try {
      // Removed user filtering to get total for all users
      const { data, error } = await supabase
        .from('withdrawals')
        .select('amount');
      
      if (error) {
        console.error("Error fetching total withdrawals:", error);
        return 0;
      }
      
      return data ? data.reduce((total, withdrawal) => total + Number(withdrawal.amount), 0) : 0;
    } catch (err) {
      console.error("Exception fetching total withdrawals:", err);
      return 0;
    }
  },

  getTotalWithdrawalsByMonth: async (monthYear: string): Promise<number> => {
    try {
      // Removed user filtering to get total for all users in the month
      const { data, error } = await supabase
        .from('withdrawals')
        .select('amount')
        .eq('monthyear', monthYear);
      
      if (error) {
        console.error("Error fetching monthly withdrawals:", error);
        return 0;
      }
      
      return data ? data.reduce((total, withdrawal) => total + Number(withdrawal.amount), 0) : 0;
    } catch (err) {
      console.error("Exception fetching monthly withdrawals:", err);
      return 0;
    }
  },

  getTotalWithdrawalsByPartner: async (partner: string): Promise<number> => {
    try {
      // Get withdrawals by partner name (recipient field)
      const { data, error } = await supabase
        .from('withdrawals')
        .select('amount')
        .eq('recipient', partner);
      
      if (error) {
        console.error("Error fetching partner withdrawals:", error);
        return 0;
      }
      
      return data ? data.reduce((total, withdrawal) => total + Number(withdrawal.amount), 0) : 0;
    } catch (err) {
      console.error("Exception fetching partner withdrawals:", err);
      return 0;
    }
  }
};
