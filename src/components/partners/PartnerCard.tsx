
import { Users } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Partner } from "@/lib/db";
import { formatCurrency } from "@/utils/formatters";

interface PartnerCardProps {
  partner: Partner;
  netOperatingProfit: number;
  loading: boolean;
}

export function PartnerCard({ partner, netOperatingProfit, loading }: PartnerCardProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="w-full text-left">
          <Card className="bg-gradient-to-br from-background to-muted w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {partner.name}
              </CardTitle>
              <CardDescription>Share: {partner.share}%</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {formatCurrency(partner.balance)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Current balance</p>
                  <div className="mt-4 space-y-1">
                    <div className="text-sm flex justify-between">
                      <span className="text-muted-foreground">Share of profit:</span>
                      <span>{formatCurrency(netOperatingProfit * (partner.share / 100))}</span>
                    </div>
                    <div className="text-sm flex justify-between">
                      <span className="text-muted-foreground">Total withdrawals:</span>
                      <span>{formatCurrency(partner.withdrawals)}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent className="max-w-[300px] p-4">
          <h4 className="font-semibold mb-2">Balance Calculation</h4>
          <p className="mb-2 text-sm">Balance is calculated as:</p>
          <p className="text-sm mb-1">{partner.share}% of Net Operating Profit - Total Withdrawals</p>
          <p className="text-sm mb-1">{formatCurrency(netOperatingProfit * (partner.share / 100))} - {formatCurrency(partner.withdrawals)}</p>
          <p className="text-sm font-semibold">{formatCurrency(partner.balance)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
