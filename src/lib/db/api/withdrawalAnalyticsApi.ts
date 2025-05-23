
import { supabase } from "@/integrations/supabase/client";

export const withdrawalAnalyticsApi = {
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
