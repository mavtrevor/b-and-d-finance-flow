
import { MonthSelector } from "./month-selector";

interface PageHeaderProps {
  title: string;
  description?: string;
  showMonthSelector?: boolean;
  onMonthChange?: (month: string) => void;
  initialMonth?: string;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  showMonthSelector = false,
  onMonthChange,
  initialMonth,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-6 border-b">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>
      
      <div className="flex mt-4 md:mt-0 items-center gap-4">
        {showMonthSelector && onMonthChange && (
          <MonthSelector onMonthChange={onMonthChange} initialMonth={initialMonth} />
        )}
        
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
