
import { supabase } from "@/integrations/supabase/client";
import { Withdrawal } from "../types";

// Transform from DB format to our interface
export const mapDbWithdrawalToModel = (item: any): Withdrawal => ({
  id: item.id,
  date: new Date(item.date),
  recipient: item.recipient,
  amount: item.amount,
  description: item.description,
  monthYear: item.monthyear,
  createdAt: item.createdat ? new Date(item.createdat) : undefined,
  updatedAt: item.updatedat ? new Date(item.updatedat) : undefined
});
