
import { Wallet } from "lucide-react";
import { SummaryCard } from "@/components/ui/summary-card";

interface WithdrawalSummaryProps {
  totalBalance: number;
  withdrawalsThisMonth: number;
  remainingBalance: number;
  loading: boolean;
}

export function WithdrawalSummary({
  totalBalance,
  withdrawalsThisMonth,
  remainingBalance,
  loading,
}: WithdrawalSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
      <SummaryCard 
        title="Total Available Balance" 
        value={totalBalance} 
        icon={<Wallet className="h-4 w-4" />}
        loading={loading}
      />
      <SummaryCard 
        title="Withdrawals This Month" 
        value={withdrawalsThisMonth}
        loading={loading}
      />
      <SummaryCard 
        title="Remaining Balance" 
        value={remainingBalance}
        loading={loading}
      />
    </div>
  );
}
