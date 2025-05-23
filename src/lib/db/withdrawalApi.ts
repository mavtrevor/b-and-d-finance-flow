
import { Withdrawal } from "./types";
import { User } from "@supabase/supabase-js";
import { withdrawalCrudApi } from "./api/withdrawalCrudApi";
import { withdrawalAnalyticsApi } from "./api/withdrawalAnalyticsApi";

// Export all withdrawal-related API functions as a single object
export const withdrawalApi = {
  // CRUD operations
  getByMonth: withdrawalCrudApi.getByMonth,
  add: withdrawalCrudApi.add,
  update: withdrawalCrudApi.update,
  delete: withdrawalCrudApi.delete,
  
  // Analytics operations
  getTotalWithdrawals: withdrawalAnalyticsApi.getTotalWithdrawals,
  getTotalWithdrawalsByMonth: withdrawalAnalyticsApi.getTotalWithdrawalsByMonth,
  getTotalWithdrawalsByPartner: withdrawalAnalyticsApi.getTotalWithdrawalsByPartner
};
