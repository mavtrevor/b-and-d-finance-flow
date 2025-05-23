
import { Award, InfoIcon } from "lucide-react";
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
import { formatCurrency } from "@/utils/formatters";

interface ManagerCommissionCardProps {
  managerCommission: number;
  currentMonth: string;
  loading: boolean;
}

export function ManagerCommissionCard({ managerCommission, currentMonth, loading }: ManagerCommissionCardProps) {
  return (
    <Card className="bg-gradient-to-br from-background to-muted/70 border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-500" />
          <span>Sonia (Manager)</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[250px]">
                <p>Commission is calculated based on primary amounts only, excluding caution fees.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>Monthly Commission</CardDescription>
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
              {formatCurrency(managerCommission)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Total commission for {new Date(currentMonth + "-01").toLocaleString('default', { month: 'long', year: 'numeric' })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Based on primary amounts only</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
