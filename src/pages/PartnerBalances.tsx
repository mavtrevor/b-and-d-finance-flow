
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
import { Users } from "lucide-react";

export function PartnerBalances() {
  // Placeholder data for partners
  const partners = [
    { id: '1', name: 'Partner A', share: 50, balance: 250000 },
    { id: '2', name: 'Partner B', share: 50, balance: 250000 },
  ];

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Partner Balances"
        description="Manage profit sharing between partners"
        actions={
          <Button disabled>
            Add Partner
          </Button>
        }
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
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
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('en-NG', { 
                  style: 'currency', 
                  currency: 'NGN',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0 
                }).format(partner.balance)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Current balance</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Partner Management</CardTitle>
          <CardDescription>Configure profit sharing arrangements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Users className="mx-auto h-12 w-12 opacity-30 mb-3" />
            <h3 className="text-lg font-medium mb-2">Partner Management</h3>
            <p>This feature will be implemented in the next phase.</p>
            <p>You'll need to create the partners table in the database first.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
