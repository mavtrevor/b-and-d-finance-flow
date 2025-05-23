
import { BarChart3, Users } from "lucide-react";
import { SummaryCard } from "@/components/ui/summary-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PartnersSummaryProps {
  netOperatingProfit: number;
  totalWithdrawals: number;
  loading: boolean;
}

export function PartnersSummary({ netOperatingProfit, totalWithdrawals, loading }: PartnersSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
      <SummaryCard
        title="Net Operating Profit"
        value={netOperatingProfit}
        icon={<BarChart3 className="h-4 w-4" />}
        loading={loading}
        className="bg-gradient-to-br from-background to-green-50"
      />
      <SummaryCard
        title="Total Withdrawals"
        value={totalWithdrawals}
        icon={<Users className="h-4 w-4" />}
        loading={loading}
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="w-full">
            <SummaryCard
              title="Remaining Available Balance"
              value={Math.max(0, netOperatingProfit - totalWithdrawals)}
              icon={<Users className="h-4 w-4" />}
              loading={loading}
              className="bg-gradient-to-br from-background to-blue-50"
            />
          </TooltipTrigger>
          <TooltipContent className="max-w-[300px]">
            <p>This is the total Net Operating Profit minus all withdrawals.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
