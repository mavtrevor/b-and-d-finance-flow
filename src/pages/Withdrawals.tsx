
import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { SummaryCard } from "@/components/ui/summary-card";

export function Withdrawals() {
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });

  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
  };

  return (
    <div className="w-full max-w-full">
      <PageHeader
        title="Withdrawals"
        description="Manage partner withdrawals"
        showMonthSelector
        onMonthChange={handleMonthChange}
        initialMonth={currentMonth}
        actions={
          <Button disabled>
            Record Withdrawal
          </Button>
        }
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <SummaryCard 
          title="Total Available Balance" 
          value={0} 
          icon={<Wallet className="h-4 w-4" />} 
        />
        <SummaryCard 
          title="Withdrawals This Month" 
          value={0} 
        />
        <SummaryCard 
          title="Remaining Balance" 
          value={0} 
        />
      </div>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
          <CardDescription>Partner withdrawal records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Wallet className="mx-auto h-12 w-12 opacity-30 mb-3" />
            <h3 className="text-lg font-medium mb-2">No Withdrawal Records</h3>
            <p className="text-sm">This feature will be implemented in the next phase.</p>
            <p className="text-sm">You'll need to create the withdrawals table in the database first.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
