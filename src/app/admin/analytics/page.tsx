// src/app/admin/analytics/page.tsx
import { Badge } from '@/components/ui/badge';
import ShopAnalytics from '@/components/admin/ShopAnalytics';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <Badge variant="outline" className="text-blue-600">Sokoo</Badge>
      </div>

      {/* Analytics Components */}
      <ShopAnalytics />
    </div>
  );
}