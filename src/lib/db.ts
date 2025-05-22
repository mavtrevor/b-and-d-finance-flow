
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  Timestamp,
  DocumentReference,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// Type definitions
export interface Income {
  id: string;
  primaryAmount: number;
  cautionFee: number;
  commission: number;
  netIncome: number;
  clientName: string;
  broughtBy: string;
  date: Date | Timestamp;
  monthYear: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: Date | Timestamp;
  notes?: string;
  monthYear: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface Withdrawal {
  id: string;
  partnerName: string;
  amount: number;
  date: Date | Timestamp;
  notes?: string;
  monthYear: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface MonthlySummary {
  id: string;
  monthYear: string;
  totalIncome: number;
  totalCommission: number;
  totalExpenses: number;
  netProfit: number;
  desmondShare: number;
  bethelShare: number;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface FixedCost {
  id: string;
  name: string;
  amount: number;
  category: string;
  autoAddMonthly: boolean;
}

// Helper functions
const formatDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const currentMonthYear = (): string => {
  const now = new Date();
  return formatDate(now);
};

// Generic Firestore functions
const getCollection = <T>(collectionName: string): Promise<T[]> => {
  return getDocs(collection(db, collectionName)).then((snapshot) => {
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  });
};

const getDocumentById = async <T>(
  collectionName: string,
  docId: string
): Promise<T | null> => {
  const docRef = doc(db, collectionName, docId);
  const docSnapshot = await getDoc(docRef);

  if (docSnapshot.exists()) {
    return {
      id: docSnapshot.id,
      ...docSnapshot.data(),
    } as T;
  }

  return null;
};

const getDocumentsByMonthYear = async <T>(
  collectionName: string,
  monthYear: string
): Promise<T[]> => {
  const q = query(
    collection(db, collectionName),
    where("monthYear", "==", monthYear)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as T[];
};

const createDocument = async <T>(
  collectionName: string,
  data: Omit<T, "id" | "createdAt" | "updatedAt">
): Promise<T> => {
  const now = new Date();
  const docWithTimestamps = {
    ...data,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
    monthYear: data.monthYear || currentMonthYear(),
  };

  const docRef = await addDoc(
    collection(db, collectionName),
    docWithTimestamps
  );
  
  return {
    id: docRef.id,
    ...docWithTimestamps,
  } as T;
};

const updateDocument = async <T>(
  collectionName: string,
  id: string,
  data: Partial<T>
): Promise<void> => {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.fromDate(new Date()),
  });
};

const deleteDocument = async (
  collectionName: string,
  id: string
): Promise<void> => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
};

// Specific data functions
export const incomeApi = {
  getAll: () => getCollection<Income>("incomes"),
  getById: (id: string) => getDocumentById<Income>("incomes", id),
  getByMonth: (monthYear: string) =>
    getDocumentsByMonthYear<Income>("incomes", monthYear),
  create: (income: Omit<Income, "id" | "createdAt" | "updatedAt">) =>
    createDocument<Income>("incomes", income),
  update: (id: string, income: Partial<Income>) =>
    updateDocument<Income>("incomes", id, income),
  delete: (id: string) => deleteDocument("incomes", id),
};

export const expenseApi = {
  getAll: () => getCollection<Expense>("expenses"),
  getById: (id: string) => getDocumentById<Expense>("expenses", id),
  getByMonth: (monthYear: string) =>
    getDocumentsByMonthYear<Expense>("expenses", monthYear),
  create: (expense: Omit<Expense, "id" | "createdAt" | "updatedAt">) =>
    createDocument<Expense>("expenses", expense),
  update: (id: string, expense: Partial<Expense>) =>
    updateDocument<Expense>("expenses", id, expense),
  delete: (id: string) => deleteDocument("expenses", id),
};

export const withdrawalApi = {
  getAll: () => getCollection<Withdrawal>("withdrawals"),
  getById: (id: string) => getDocumentById<Withdrawal>("withdrawals", id),
  getByMonth: (monthYear: string) =>
    getDocumentsByMonthYear<Withdrawal>("withdrawals", monthYear),
  create: (withdrawal: Omit<Withdrawal, "id" | "createdAt" | "updatedAt">) =>
    createDocument<Withdrawal>("withdrawals", withdrawal),
  update: (id: string, withdrawal: Partial<Withdrawal>) =>
    updateDocument<Withdrawal>("withdrawals", id, withdrawal),
  delete: (id: string) => deleteDocument("withdrawals", id),
};

export const monthlySummaryApi = {
  getByMonth: async (monthYear: string): Promise<MonthlySummary | null> => {
    const q = query(
      collection(db, "monthlySummaries"),
      where("monthYear", "==", monthYear)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as MonthlySummary;
  },
  
  create: async (summary: Omit<MonthlySummary, "id" | "createdAt" | "updatedAt">) => {
    return createDocument<MonthlySummary>("monthlySummaries", summary);
  },
  
  update: (id: string, summary: Partial<MonthlySummary>) =>
    updateDocument<MonthlySummary>("monthlySummaries", id, summary),
};

// Settings API
export const DEFAULT_FIXED_COSTS: Omit<FixedCost, "id">[] = [
  {
    name: "Cleaner Salary",
    amount: 35000,
    category: "Salary",
    autoAddMonthly: true,
  },
  {
    name: "Netflix Subscription",
    amount: 5500,
    category: "Subscription",
    autoAddMonthly: true,
  },
  {
    name: "Internet Subscription",
    amount: 25000,
    category: "Subscription",
    autoAddMonthly: true,
  },
];

export const settingsApi = {
  getFixedCosts: async (): Promise<FixedCost[]> => {
    const docRef = doc(db, "settings", "appConfiguration");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists() && docSnap.data().fixedCosts) {
      return docSnap.data().fixedCosts.map((cost: any, index: number) => ({
        ...cost,
        id: cost.id || String(index),
      }));
    }
    
    // Return default fixed costs if not found
    return DEFAULT_FIXED_COSTS.map((cost, index) => ({
      ...cost,
      id: String(index),
    }));
  },
  
  saveFixedCosts: async (fixedCosts: FixedCost[]): Promise<void> => {
    const docRef = doc(db, "settings", "appConfiguration");
    await setDoc(docRef, { fixedCosts }, { merge: true });
  },
  
  autoGenerateMonthlyExpenses: async (monthYear: string): Promise<void> => {
    const fixedCosts = await settingsApi.getFixedCosts();
    const autoFixedCosts = fixedCosts.filter(cost => cost.autoAddMonthly);
    
    // Check for existing expenses for this month to avoid duplicates
    const existingExpenses = await expenseApi.getByMonth(monthYear);
    const existingExpenseNames = existingExpenses.map(e => e.name.toLowerCase());
    
    // Get current date but use the month from monthYear
    const [year, month] = monthYear.split("-");
    const currentDate = new Date();
    currentDate.setFullYear(Number(year));
    currentDate.setMonth(Number(month) - 1);
    
    // Add each expense that doesn't already exist
    for (const cost of autoFixedCosts) {
      if (!existingExpenseNames.includes(cost.name.toLowerCase())) {
        await expenseApi.create({
          name: cost.name,
          amount: cost.amount,
          category: cost.category,
          date: Timestamp.fromDate(currentDate),
          monthYear: monthYear,
          notes: "Auto-generated from fixed costs",
        });
      }
    }
  },
};
