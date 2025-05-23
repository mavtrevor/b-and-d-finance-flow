
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { partnerApi, withdrawalApi } from "@/lib/db";
import { Users, Award, InfoIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Partner } from "@/lib/db";
import { SummaryCard } from "@/components/ui/summary-card";

export function PartnerBalances() {
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });
  const [managerCommission, setManagerCommission] = useState<number>(0);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [totalWithdrawals, setTotalWithdrawals] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchManagerCommission();
    fetchPartners();
    fetchTotalWithdrawals();
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

  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { 
      style: 'currency', 
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(amount);
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
      
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <SummaryCard
          title="Total Withdrawals"
          value={totalWithdrawals}
          icon={<Users className="h-4 w-4" />}
          loading={loading}
        />
      </div>
      
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {partners.map((partner) => (
          <Card key={partner.id} className="bg-gradient-to-br from-background to-muted">
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
                </>
              )}
            </CardContent>
          </Card>
        ))}
        
        {/* Manager's Commission Card */}
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
      </div>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Partner Management</CardTitle>
          <CardDescription>Configure profit sharing arrangements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Users className="mx-auto h-12 w-12 opacity-30 mb-3" />
            <h3 className="text-lg font-medium mb-2">Partner Management</h3>
            <p className="text-sm">This feature will be implemented in the next phase.</p>
            <p className="text-sm">You'll need to create the partners table in the database first.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
