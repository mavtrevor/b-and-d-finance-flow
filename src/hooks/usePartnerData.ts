
import { useState, useEffect } from "react";
import { partnerApi, withdrawalApi } from "@/lib/db";
import { Partner } from "@/lib/db";
import { useToast } from "@/components/ui/use-toast";

export function usePartnerData(currentMonth: string) {
  const [managerCommission, setManagerCommission] = useState<number>(0);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [totalWithdrawals, setTotalWithdrawals] = useState<number>(0);
  const [netOperatingProfit, setNetOperatingProfit] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchManagerCommission();
    fetchPartners();
    fetchTotalWithdrawals();
    fetchNetOperatingProfit();
  }, [currentMonth]);

  const fetchManagerCommission = async () => {
    setLoading(true);
    try {
      const commissionTotal = await partnerApi.getManagerCommission(currentMonth);
      setManagerCommission(commissionTotal);
    } catch (error) {
      console.error("Error fetching manager commission:", error);
      toast({
        variant: "destructive",
        title: "Failed to load manager commission",
        description: "There was a problem loading the commission data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const partnersData = await partnerApi.getAll();
      setPartners(partnersData);
    } catch (error) {
      console.error("Error fetching partners:", error);
      toast({
        variant: "destructive",
        title: "Failed to load partner data",
        description: "There was a problem loading the partner balances.",
      });
    }
  };
  
  const fetchTotalWithdrawals = async () => {
    try {
      const withdrawalsTotal = await withdrawalApi.getTotalWithdrawals();
      setTotalWithdrawals(withdrawalsTotal);
    } catch (error) {
      console.error("Error fetching total withdrawals:", error);
      toast({
        variant: "destructive",
        title: "Failed to load withdrawals data",
        description: "There was a problem loading the withdrawals data.",
      });
    }
  };
  
  const fetchNetOperatingProfit = async () => {
    try {
      const profit = await partnerApi.getNetOperatingProfit();
      setNetOperatingProfit(profit);
    } catch (error) {
      console.error("Error fetching net operating profit:", error);
      toast({
        variant: "destructive",
        title: "Failed to load profit data",
        description: "There was a problem calculating the net operating profit.",
      });
    }
  };

  return {
    managerCommission,
    partners,
    totalWithdrawals,
    netOperatingProfit,
    loading
  };
}
