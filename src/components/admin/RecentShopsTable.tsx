// src/components/admin/RecentShopsTable.tsx
'use client';

import React, { useState } from 'react';
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

// Types
interface Shop {
  id: number;
  name: string;
  owner: string;
  location: string;
  industry: string;
  status: 'Active' | 'Inactive' | 'New';
  dateApplied: string;
}

// Mock data
const mockShops: Shop[] = [
  {
    id: 1,
    name: 'Fashion Hub',
    owner: 'Jane Smith',
    location: 'Central Mall, Nairobi',
    industry: 'Apparel',
    status: 'New',
    dateApplied: 'May 15, 2025'
  },
  {
    id: 2,
    name: 'Tech World',
    owner: 'John Doe',
    location: 'Garden City Mall, Nairobi',
    industry: 'Electronics',
    status: 'New',
    dateApplied: 'May 16, 2025'
  },
  {
    id: 3,
    name: 'Glamour Beauty',
    owner: 'Rose Kamau',
    location: 'Westgate Mall, Nairobi',
    industry: 'Cosmetics',
    status: 'New',
    dateApplied: 'May 15, 2025'
  },
  {
    id: 4,
    name: 'Shoe Haven',
    owner: 'David Kamau',
    location: 'Junction Mall, Nairobi',
    industry: 'Shoes',
    status: 'New',
    dateApplied: 'May 9, 2025'
  }
];

export function RecentShopsTable() {
  const [shops, setShops] = useState<Shop[]>(mockShops);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean, 
    shopId: number | null,
    action: 'approve' | 'reject' | null,
    shopName: string
  }>({
    open: false,
    shopId: null,
    action: null,
    shopName: ''
  });

  // Handle approval/rejection
  const handleAction = () => {
    if (actionDialog.shopId && actionDialog.action) {
      if (actionDialog.action === 'approve') {
        // In a real app, this would call an API to approve the shop
        setShops(shops.map(shop => 
          shop.id === actionDialog.shopId ? { ...shop, status: 'Active' as const } : shop
        ));
      } else {
        // In a real app, this would call an API to reject the shop
        setShops(shops.filter(shop => shop.id !== actionDialog.shopId));
      }
      setActionDialog({ open: false, shopId: null, action: null, shopName: '' });
    }
  };

  // Filter to only show new shops
  const newShops = shops.filter(shop => shop.status === 'New');

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
            {newShops.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500">
                  No new shops to approve.
                </td>
              </tr>
            ) : (
              newShops.map((shop) => (
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
                      {/* Eye icon removed as requested */}
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