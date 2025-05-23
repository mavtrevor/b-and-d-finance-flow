
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useToast } from "@/hooks/use-toast";
import { Withdrawal, partnerApi, withdrawalApi } from "@/lib/db";

export function useWithdrawals(initialMonth: string) {
  const [currentMonth, setCurrentMonth] = useState<string>(initialMonth);
  const [totalBalance, setTotalBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [withdrawalsThisMonth, setWithdrawalsThisMonth] = useState(0);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const fetchBalances = async () => {
    setLoading(true);
    try {
      const totalAvailable = await partnerApi.getTotalAvailableBalance();
      setTotalBalance(totalAvailable);
      
      const monthWithdrawals = await withdrawalApi.getTotalWithdrawalsByMonth(currentMonth);
      setWithdrawalsThisMonth(monthWithdrawals);
    } catch (error) {
      console.error("Error fetching balances:", error);
      toast({
        variant: "destructive",
        title: "Failed to load balances",
        description: "There was a problem loading the balance data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const withdrawalData = await withdrawalApi.getByMonth(currentMonth);
      setWithdrawals(withdrawalData);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      toast({
        variant: "destructive",
        title: "Failed to load withdrawals",
        description: "There was a problem loading the withdrawal data.",
      });
    }
  };

  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
  };

  const refreshData = () => {
    fetchBalances();
    fetchWithdrawals();
  };

  useEffect(() => {
    refreshData();
  }, [currentMonth]);

  return {
    currentMonth,
    totalBalance,
    withdrawals,
    withdrawalsThisMonth,
    loading,
    handleMonthChange,
    refreshData,
    remainingBalance: totalBalance
  };
}
