
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { useState, useEffect } from "react";

interface MonthSelectorProps {
  onMonthChange: (month: string) => void;
  initialMonth?: string;
}

export function MonthSelector({ onMonthChange, initialMonth }: MonthSelectorProps) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    if (initialMonth) return initialMonth;
    
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });
  
  useEffect(() => {
    onMonthChange(selectedMonth);
  }, [selectedMonth, onMonthChange]);

  const navigateMonth = (direction: "prev" | "next") => {
    const [year, month] = selectedMonth.split("-").map(Number);
    let newMonth, newYear;
    
    if (direction === "prev") {
      newMonth = month - 1;
      newYear = year;
      if (newMonth < 1) {
        newMonth = 12;
        newYear = year - 1;
      }
    } else {
      newMonth = month + 1;
      newYear = year;
      if (newMonth > 12) {
        newMonth = 1;
        newYear = year + 1;
      }
    }
    
    setSelectedMonth(`${newYear}-${String(newMonth).padStart(2, "0")}`);
  };

  const formatMonthDisplay = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => navigateMonth("prev")}
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <span className="font-medium text-lg min-w-32 text-center">
        {formatMonthDisplay(selectedMonth)}
      </span>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => navigateMonth("next")}
        aria-label="Next month"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
