
import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { usePartnerData } from "@/hooks/usePartnerData";
import { PartnerCard } from "@/components/partners/PartnerCard";
import { ManagerCommissionCard } from "@/components/partners/ManagerCommissionCard";
import { PartnerManagementCard } from "@/components/partners/PartnerManagementCard";
import { PartnersSummary } from "@/components/partners/PartnersSummary";

export function PartnerBalances() {
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });

  const { 
    managerCommission, 
    partners, 
    totalWithdrawals, 
    netOperatingProfit, 
    loading 
  } = usePartnerData(currentMonth);

  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
  };

  return (
    <div className="w-full max-w-full">
      <PageHeader
        title="Partner Balances"
        description="Manage profit sharing between partners"
        showMonthSelector
        onMonthChange={handleMonthChange}
        initialMonth={currentMonth}
      />
      
      <PartnersSummary 
        netOperatingProfit={netOperatingProfit} 
        totalWithdrawals={totalWithdrawals} 
        loading={loading} 
      />
      
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {partners.map((partner) => (
          <PartnerCard 
            key={partner.id} 
            partner={partner} 
            netOperatingProfit={netOperatingProfit}
            loading={loading}
          />
        ))}
        
        <ManagerCommissionCard 
          managerCommission={managerCommission}
          currentMonth={currentMonth}
          loading={loading}
        />
      </div>
      
      <PartnerManagementCard />
    </div>
  );
}
