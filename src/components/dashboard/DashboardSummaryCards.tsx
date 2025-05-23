
import { SummaryCard } from "@/components/ui/summary-card";
import { ArrowDownLeft, ArrowUpRight, DollarSign, Users, TrendingUp } from "lucide-react";

interface DashboardSummaryCardsProps {
  totalIncome: number;
  totalCommission: number;
  totalExpenses: number;
  netOperatingProfit: number;
  partnerShare: number;
  loading: boolean;
}

export function DashboardSummaryCards({
  totalIncome,
  totalCommission,
  totalExpenses,
  netOperatingProfit,
  partnerShare,
  loading
}: DashboardSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <SummaryCard
        title="Total Income (Primary)"
        value={totalIncome}
        loading={loading}
        icon={<ArrowDownLeft className="h-5 w-5" />}
      />
      <SummaryCard
        title="Total Commissions Paid"
        value={totalCommission}
        loading={loading}
        icon={<Users className="h-5 w-5" />}
      />
      <SummaryCard
        title="Total Expenses"
        value={totalExpenses}
        loading={loading}
        icon={<ArrowUpRight className="h-5 w-5" />}
      />
      <SummaryCard
        title="Net Operating Profit"
        value={netOperatingProfit}
        loading={loading}
        icon={<TrendingUp className="h-5 w-5" />}
        className={netOperatingProfit >= 0 ? "border-b-green-500 border-b-2" : "border-red-500 border-b-2"}
      />
      <SummaryCard
        title="Desmond's Share (Ops)"
        value={partnerShare}
        loading={loading}
        icon={<DollarSign className="h-5 w-5" />}
      />
      <SummaryCard
        title="Bethel's Share (Ops)"
        value={partnerShare}
        loading={loading}
        icon={<DollarSign className="h-5 w-5" />}
      />
    </div>
  );
}
