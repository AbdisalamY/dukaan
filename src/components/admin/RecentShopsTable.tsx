// src/components/admin/RecentShopsTable.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { db, DatabaseShop } from '@/lib/database';

// Types
interface Shop {
  id: string;
  name: string;
  owner: string;
  location: string;
  industry: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  dateApplied: string;
}

export function RecentShopsTable() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean, 
    shopId: string | null,
    action: 'approve' | 'reject' | null,
    shopName: string
  }>({
    open: false,
    shopId: null,
    action: null,
    shopName: ''
  });

  // Fetch pending shops from database
  useEffect(() => {
    const fetchPendingShops = async () => {
      try {
        setLoading(true);
        const response = await db.getShops({
          status: 'pending',
          limit: 10
        });

        const transformedShops: Shop[] = response.shops?.map((shop: DatabaseShop) => ({
          id: shop.id,
          name: shop.name,
          owner: shop.profiles?.full_name || shop.profiles?.email || 'Unknown',
          location: `${shop.mall}, ${shop.city}`,
          industry: shop.industry,
          status: shop.status,
          dateApplied: new Date(shop.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        })) || [];

        setShops(transformedShops);
      } catch (error) {
        console.error('Error fetching pending shops:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingShops();
  }, []);

  // Handle approval/rejection
  const handleAction = async () => {
    if (actionDialog.shopId && actionDialog.action) {
      try {
        const newStatus = actionDialog.action === 'approve' ? 'approved' : 'rejected';
        await db.updateShop(actionDialog.shopId, { status: newStatus });
        
        if (actionDialog.action === 'approve') {
          setShops(shops.map(shop => 
            shop.id === actionDialog.shopId ? { ...shop, status: 'approved' as const } : shop
          ));
        } else {
          setShops(shops.filter(shop => shop.id !== actionDialog.shopId));
        }
        
        setActionDialog({ open: false, shopId: null, action: null, shopName: '' });
      } catch (error) {
        console.error('Error updating shop status:', error);
      }
    }
  };

  // Filter to only show pending shops
  const pendingShops = shops.filter(shop => shop.status === 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading pending shops...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="py-3 px-4 text-left font-medium text-gray-500">Shop Name</th>
              <th className="py-3 px-4 text-left font-medium text-gray-500">Industry</th>
              <th className="py-3 px-4 text-left font-medium text-gray-500">Date Applied</th>
              <th className="py-3 px-4 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingShops.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500">
                  No new shops to approve.
                </td>
              </tr>
            ) : (
              pendingShops.map((shop) => (
                <tr key={shop.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium">{shop.name}</div>
                    <div className="text-xs text-gray-500">{shop.owner}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{shop.industry}</td>
                  <td className="py-3 px-4 text-gray-600">{shop.dateApplied}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                        onClick={() => setActionDialog({
                          open: true,
                          shopId: shop.id,
                          action: 'approve',
                          shopName: shop.name
                        })}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                        onClick={() => setActionDialog({
                          open: true,
                          shopId: shop.id,
                          action: 'reject',
                          shopName: shop.name
                        })}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog({ ...actionDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === 'approve' ? 'Approve Shop' : 'Reject Shop'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.action === 'approve' 
                ? `Are you sure you want to approve "${actionDialog.shopName}"? This will make the shop active and visible to customers.` 
                : `Are you sure you want to reject "${actionDialog.shopName}"? This cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setActionDialog({ open: false, shopId: null, action: null, shopName: '' })}
            >
              Cancel
            </Button>
            <Button 
              variant={actionDialog.action === 'approve' ? 'default' : 'destructive'}
              onClick={handleAction}
            >
              {actionDialog.action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
