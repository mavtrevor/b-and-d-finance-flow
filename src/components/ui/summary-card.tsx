
import { Card, CardContent, CardHeader, CardTitle } from "./card";

interface SummaryCardProps {
  title: string;
  value: string | number;
  currency?: boolean;
  icon?: React.ReactNode;
  className?: string;
  loading?: boolean;
}

export function SummaryCard({ 
  title, 
  value, 
  currency = true, 
  icon, 
  className,
  loading = false 
}: SummaryCardProps) {
  const formattedValue = currency 
    ? new Intl.NumberFormat('en-NG', { 
        style: 'currency', 
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(Number(value || 0)) 
    : value;
  
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent"></div>
            <span className="text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <div className="text-2xl font-bold">{formattedValue}</div>
        )}
      </CardContent>
    </Card>
  );
}
