
import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Withdrawal } from "@/lib/db";
import { WithdrawalDialog } from "@/components/withdrawals/WithdrawalDialog";
import { DeleteWithdrawalDialog } from "@/components/withdrawals/DeleteWithdrawalDialog";
import { WithdrawalTable } from "@/components/withdrawals/WithdrawalTable";
import { WithdrawalSummary } from "@/components/withdrawals/WithdrawalSummary";
import { useWithdrawals } from "@/hooks/useWithdrawals";

export function Withdrawals() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentWithdrawal, setCurrentWithdrawal] = useState<Withdrawal | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Initialize with current month
  const initialMonth = (() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  })();
  
  const {
    currentMonth,
    totalBalance,
    withdrawals,
    withdrawalsThisMonth,
    loading,
    handleMonthChange,
    refreshData,
    remainingBalance
  } = useWithdrawals(initialMonth);

  const handleEditWithdrawal = (withdrawal: Withdrawal) => {
    setCurrentWithdrawal(withdrawal);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDeleteWithdrawal = (withdrawal: Withdrawal) => {
    setCurrentWithdrawal(withdrawal);
    setIsDeleteDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setIsEditMode(false);
      setCurrentWithdrawal(null);
    }
    setIsDialogOpen(open);
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
          <Button onClick={() => {
            setIsEditMode(false);
            setCurrentWithdrawal(null);
            setIsDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" /> Record Withdrawal
          </Button>
        }
      />
      
      <WithdrawalSummary
        totalBalance={totalBalance}
        withdrawalsThisMonth={withdrawalsThisMonth}
        remainingBalance={remainingBalance}
        loading={loading}
      />
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
          <CardDescription>Partner withdrawal records</CardDescription>
        </CardHeader>
        <CardContent>
          <WithdrawalTable
            withdrawals={withdrawals}
            onEdit={handleEditWithdrawal}
            onDelete={handleDeleteWithdrawal}
            currentMonth={currentMonth}
          />
        </CardContent>
      </Card>

      {/* Create/Edit Withdrawal Dialog */}
      <WithdrawalDialog
        isOpen={isDialogOpen}
        onOpenChange={handleDialogClose}
        isEditMode={isEditMode}
        currentWithdrawal={currentWithdrawal}
        onSuccess={refreshData}
        currentMonth={currentMonth}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteWithdrawalDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        withdrawal={currentWithdrawal}
        onSuccess={refreshData}
      />
    </div>
  );
}
