
import { Wallet, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { Withdrawal } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WithdrawalTableProps {
  withdrawals: Withdrawal[];
  onEdit: (withdrawal: Withdrawal) => void;
  onDelete: (withdrawal: Withdrawal) => void;
  currentMonth: string;
}

export function WithdrawalTable({
  withdrawals,
  onEdit,
  onDelete,
  currentMonth,
}: WithdrawalTableProps) {
  if (withdrawals.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Wallet className="mx-auto h-12 w-12 opacity-30 mb-3" />
        <h3 className="text-lg font-medium mb-2">No Withdrawal Records</h3>
        <p className="text-sm">
          No withdrawals have been recorded for {new Date(currentMonth + "-01").toLocaleString('default', { month: 'long', year: 'numeric' })}.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Recipient</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="w-[100px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {withdrawals.map((withdrawal) => (
          <TableRow key={withdrawal.id}>
            <TableCell>{formatDate(withdrawal.date)}</TableCell>
            <TableCell>{withdrawal.recipient}</TableCell>
            <TableCell>{formatCurrency(Number(withdrawal.amount))}</TableCell>
            <TableCell>{withdrawal.description || "-"}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(withdrawal)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(withdrawal)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
