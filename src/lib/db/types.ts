
import { User } from "@supabase/supabase-js";

// Create a simple interface for document types
export interface BaseDocument {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  monthYear?: string;
}

export interface Income extends BaseDocument {
  date: Date;
  clientName: string;
  broughtBy: string;
  primaryAmount: number;
  cautionFee?: number;
  commission: number;
  netIncome: number;
}

export interface Expense extends BaseDocument {
  date: Date;
  name: string;
  category: string;
  amount: number;
  notes?: string;
}

export interface Withdrawal extends BaseDocument {
  date: Date;
  amount: number;
  recipient: string;
  description?: string;
}

export interface Partner {
  id: string;
  name: string;
  share: number;
  balance: number;
  withdrawals: number;
}
