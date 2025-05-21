// src/components/shop/ShopCard.tsx
'use client';

import Image from 'next/image';
import { Edit, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardFooter
} from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface ShopCardProps {
  shop: {
    id: number;
    logo: string;
    name: string;
    industry: string;
    shopNumber: string;
    city: string;
    mall: string;
    whatsappNumber: string;
    status: 'pending' | 'approved' | 'rejected';
  };
  onEdit: () => void;
}

export function ShopCard({ shop, onEdit }: ShopCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-40 h-40 relative border rounded">
            <Image 
              src={shop.logo} 
              alt={shop.name}
              fill
              sizes="160px"
              style={{ objectFit: "cover" }}
              className="rounded"
            />
          </div>
          
          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">{shop.name}</h2>
              {shop.status === 'pending' ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Pending Approval
                </span>
              ) : shop.status === 'approved' ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </span>
              ) : (
                <Badge variant="destructive" className="mt-2">Rejected</Badge>
              )}
            </div>
            
            {shop.status === 'pending' && (
              <Alert variant="default" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Waiting for Approval</AlertTitle>
                <AlertDescription>
                  Your shop is currently under review. You'll receive a notification once it's approved.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Industry</p>
                <p className="text-base">{shop.industry}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Shop Number</p>
                <p className="text-base">{shop.shopNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p className="text-base">{shop.mall}, {shop.city}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">WhatsApp Business</p>
                <p className="text-base">{shop.whatsappNumber}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t pt-4">
        <Button variant="outline" onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Information
        </Button>
      </CardFooter>
    </Card>
  );
}