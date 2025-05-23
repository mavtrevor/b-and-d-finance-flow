
import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DashboardSummaryCards } from "@/components/dashboard/DashboardSummaryCards";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { useDashboardData } from "@/hooks/useDashboardData";

export function Dashboard() {
  // Initialize selectedMonth with current month instead of empty string
  const getCurrentMonth = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  };

  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
  
  const {
    loading,
    expenses,
    totalIncome,
    totalCommission,
    totalExpenses,
    netOperatingProfit,
    partnerShare
  } = useDashboardData(selectedMonth);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Financial overview for selected period"
        showMonthSelector
        onMonthChange={setSelectedMonth}
        initialMonth={selectedMonth}
      />

      <DashboardSummaryCards
        totalIncome={totalIncome}
        totalCommission={totalCommission}
        totalExpenses={totalExpenses}
        netOperatingProfit={netOperatingProfit}
        partnerShare={partnerShare}
        loading={loading}
      />

      <DashboardCharts
        totalIncome={totalIncome}
        totalCommission={totalCommission}
        totalExpenses={totalExpenses}
        expenses={expenses}
        loading={loading}
      />
    </div>
  );
}
