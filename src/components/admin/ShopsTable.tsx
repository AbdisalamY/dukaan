// src/components/admin/ShopsTable.tsx
'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Trash2, Mail, MoreVertical } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

// Types
interface Shop {
  id: number;
  name: string;
  owner: string;
  location: string;
  industry: string;
  status: 'Active' | 'Inactive';
  joinDate: string;
}

// Mock data
const mockShops: Shop[] = [
  {
    id: 1,
    name: 'Fashion Hub',
    owner: 'Jane Smith',
    location: 'Central Mall, Nairobi',
    industry: 'Apparel',
    status: 'Active',
    joinDate: '2024-01-15'
  },
  {
    id: 2,
    name: 'Tech World',
    owner: 'John Doe',
    location: 'Garden City Mall, Nairobi',
    industry: 'Electronics',
    status: 'Active',
    joinDate: '2024-02-20'
  },
  {
    id: 3,
    name: 'Beauty Palace',
    owner: 'Mary Wanjiku',
    location: 'Westgate Mall, Nairobi',
    industry: 'Cosmetics',
    status: 'Inactive',
    joinDate: '2024-03-10'
  },
  {
    id: 4,
    name: 'Shoe Haven',
    owner: 'David Kamau',
    location: 'Junction Mall, Nairobi',
    industry: 'Shoes',
    status: 'Active',
    joinDate: '2024-04-05'
  },
  {
    id: 5,
    name: 'Kitchen Plus',
    owner: 'Sarah Ouma',
    location: 'Sarit Centre, Nairobi',
    industry: 'Home & Kitchen',
    status: 'Inactive',
    joinDate: '2024-02-10'
  }
];

const industries = [
  { value: 'all', label: 'All Industries' },
  { value: 'apparel', label: 'Apparel' },
  { value: 'cosmetics', label: 'Cosmetics' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'home & kitchen', label: 'Home & Kitchen' }
];

const statuses = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
];

export function ShopsTable() {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [shops, setShops] = useState<Shop[]>(mockShops);
  const [deleteDialog, setDeleteDialog] = useState<{open: boolean, shopId: number | null, shopName: string}>({
    open: false,
    shopId: null,
    shopName: ''
  });
  const [reminderDialog, setReminderDialog] = useState<{open: boolean, shopId: number | null, shopName: string}>({
    open: false,
    shopId: null,
    shopName: ''
  });
  const [reminderHistoryDialog, setReminderHistoryDialog] = useState<{open: boolean, shopId: number | null, shopName: string}>({
    open: false,
    shopId: null,
    shopName: ''
  });
  const [detailsDialog, setDetailsDialog] = useState<{open: boolean, shopId: number | null, shopName: string}>({
    open: false,
    shopId: null,
    shopName: ''
  });

  // Mock reminder history data
  const mockReminderHistory = [
    { id: 1, date: 'May 15, 2025', time: '10:30 AM', status: 'Sent' },
    { id: 2, date: 'May 10, 2025', time: '02:15 PM', status: 'Sent' },
    { id: 3, date: 'May 5, 2025', time: '11:00 AM', status: 'Failed' }
  ];

  // Filter shops based on search term and selected filters
  const filteredShops = shops.filter(shop => {
    const matchesSearch = 
      shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesIndustry = industryFilter === 'all' || 
      shop.industry.toLowerCase() === industryFilter.toLowerCase();
    
    const matchesStatus = statusFilter === 'all' || 
      shop.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesIndustry && matchesStatus;
  });

  // Handlers
  const handleDeleteShop = () => {
    if (deleteDialog.shopId) {
      // In a real app, this would call an API to delete the shop
      setShops(shops.filter(shop => shop.id !== deleteDialog.shopId));
      setDeleteDialog({ open: false, shopId: null, shopName: '' });
    }
  };

  const handleSendReminder = () => {
    if (reminderDialog.shopId) {
      // In a real app, this would call an API to send a payment reminder
      console.log(`Sending payment reminder to shop ID: ${reminderDialog.shopId}`);
      setReminderDialog({ open: false, shopId: null, shopName: '' });
    }
  };

  // Get status badge
  const getStatusBadge = (status: Shop['status']) => {
    switch(status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'Inactive':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Inactive</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search shops..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <div className="flex gap-3">
          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {industries.map((industry) => (
                <SelectItem key={industry.value} value={industry.value}>
                  {industry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Shops Table */}
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="py-3 px-4 text-left font-medium text-gray-500">Shop</th>
              <th className="py-3 px-4 text-left font-medium text-gray-500">Location</th>
              <th className="py-3 px-4 text-left font-medium text-gray-500">Industry</th>
              <th className="py-3 px-4 text-left font-medium text-gray-500">Status</th>
              <th className="py-3 px-4 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredShops.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">
                  No shops found matching your filters.
                </td>
              </tr>
            ) : (
              filteredShops.map((shop) => (
                <tr key={shop.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium">{shop.name}</div>
                    <div className="text-xs text-gray-500">{shop.owner}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{shop.location}</td>
                  <td className="py-3 px-4 text-gray-600">{shop.industry}</td>
                  <td className="py-3 px-4">{getStatusBadge(shop.status)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setDetailsDialog({
                          open: true,
                          shopId: shop.id,
                          shopName: shop.name
                        })}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {shop.status === 'Inactive' && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-blue-600"
                            onClick={() => setReminderDialog({ 
                              open: true, 
                              shopId: shop.id,
                              shopName: shop.name
                            })}
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            <span>Remind</span>
                          </Button>
                          
                          {/* Added Reminder History button next to Remind */}
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-blue-600"
                            onClick={() => setReminderHistoryDialog({
                              open: true,
                              shopId: shop.id,
                              shopName: shop.name
                            })}
                          >
                            <span>Reminder History</span>
                          </Button>
                        </div>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600"
                        onClick={() => setDeleteDialog({ 
                          open: true, 
                          shopId: shop.id,
                          shopName: shop.name
                        })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setDetailsDialog({
                            open: true,
                            shopId: shop.id,
                            shopName: shop.name
                          })}>
                            View Shop Details
                          </DropdownMenuItem>
                          
                          {shop.status === 'Inactive' && (
                            <>
                              <DropdownMenuItem onClick={() => setReminderDialog({ 
                                open: true, 
                                shopId: shop.id,
                                shopName: shop.name
                              })}>
                                Send Payment Reminder
                              </DropdownMenuItem>
                              
                              {/* Added a clear separation in dropdown between Remind and Reminder History */}
                              <DropdownMenuItem onClick={() => setReminderHistoryDialog({
                                open: true,
                                shopId: shop.id,
                                shopName: shop.name
                              })}>
                                View Reminder History
                              </DropdownMenuItem>
                            </>
                          )}
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => setDeleteDialog({ 
                              open: true, 
                              shopId: shop.id,
                              shopName: shop.name
                            })}
                          >
                            Delete Shop
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Showing {filteredShops.length} of {shops.length} shops</span>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">Previous</Button>
          <Button variant="default" size="sm">Next</Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ ...deleteDialog, open: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Shop</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteDialog.shopName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialog({ open: false, shopId: null, shopName: '' })}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteShop}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Reminder Dialog */}
      <Dialog open={reminderDialog.open} onOpenChange={(open) => !open && setReminderDialog({ ...reminderDialog, open: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Payment Reminder</DialogTitle>
            <DialogDescription>
              Send a payment reminder to "{reminderDialog.shopName}"? This will notify the shop owner that their payment is required to reactivate their shop.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setReminderDialog({ open: false, shopId: null, shopName: '' })}
            >
              Cancel
            </Button>
            <Button 
              variant="default"
              onClick={handleSendReminder}
            >
              Send Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reminder History Dialog */}
      <Dialog open={reminderHistoryDialog.open} onOpenChange={(open) => !open && setReminderHistoryDialog({ ...reminderHistoryDialog, open: false })}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Reminder History - {reminderHistoryDialog.shopName}</DialogTitle>
            <DialogDescription>
              View the history of payment reminders sent to this shop.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Date</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Time</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockReminderHistory.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-2 px-4 text-xs">{item.date}</td>
                      <td className="py-2 px-4 text-xs">{item.time}</td>
                      <td className="py-2 px-4 text-xs">
                        <Badge 
                          className={item.status === 'Sent' 
                            ? "bg-green-100 text-green-800 border-green-200" 
                            : "bg-red-100 text-red-800 border-red-200"
                          }
                        >
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {mockReminderHistory.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-xs text-gray-500">
                        No reminder history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              onClick={() => setReminderHistoryDialog({ open: false, shopId: null, shopName: '' })}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shop Details Dialog */}
      <Dialog open={detailsDialog.open} onOpenChange={(open) => !open && setDetailsDialog({ ...detailsDialog, open: false })}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Shop Details - {detailsDialog.shopName}</DialogTitle>
          </DialogHeader>
          
          {/* Mock shop details - in a real app, you would fetch these from your API */}
          <div className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Shop Information</h3>
                <div className="mt-2 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm font-medium">{detailsDialog.shopName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Industry</p>
                    <p className="text-sm font-medium">
                      {shops.find(s => s.id === detailsDialog.shopId)?.industry || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <div className="mt-1">
                      {getStatusBadge(shops.find(s => s.id === detailsDialog.shopId)?.status || 'Active')}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Owner Information</h3>
                <div className="mt-2 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm font-medium">
                      {shops.find(s => s.id === detailsDialog.shopId)?.owner || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm font-medium">
                      {shops.find(s => s.id === detailsDialog.shopId)?.location || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Join Date</p>
                    <p className="text-sm font-medium">
                      {new Date(shops.find(s => s.id === detailsDialog.shopId)?.joinDate || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              onClick={() => setDetailsDialog({ open: false, shopId: null, shopName: '' })}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}