
import { Users } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

export function PartnerManagementCard() {
  return (
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
  );
}
