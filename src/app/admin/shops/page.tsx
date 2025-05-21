// src/app/admin/shops/page.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShopsTable } from '@/components/admin/ShopsTable';

export default function AdminShopsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Shop Management</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Shops</CardTitle>
        </CardHeader>
        <CardContent>
          <ShopsTable />
        </CardContent>
      </Card>
    </div>
  );
}