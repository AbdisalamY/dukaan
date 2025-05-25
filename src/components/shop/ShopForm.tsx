// src/components/shop/ShopForm.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Upload } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';

interface ShopFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ShopFormData) => void;
  initialData?: Partial<ShopFormData>;
  isLoading?: boolean;
  isEditing?: boolean;
}

export interface ShopFormData {
  logo: string;
  name: string;
  industry: string;
  shopNumber: string;
  city: string;
  mall: string;
  whatsappNumber: string;
}

// Industries from database categories
const industries = [
  'Fashion', 
  'Electronics', 
  'Groceries', 
  'Toys', 
  'Books', 
  'Beauty',
  'Apparel',
  'Shoes',
  'Home & Kitchen',
  'Jewelry',
  'Sport & Fitness',
  'Health & Beauty',
  'Food & Beverage',
  'Home & Garden'
];

// Cities data - these could be fetched from database in the future
const cities = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'];

// Mock malls by city
const mallsByCity: Record<string, string[]> = {
  'Nairobi': ['The Hub', 'Two Rivers Mall', 'Garden City Mall', 'Westgate Shopping Mall', 'Village Market'],
  'Mombasa': ['Nyali Centre', 'City Mall', 'Mombasa Mall'],
  'Kisumu': ['West End Mall', 'Mega City Mall', 'United Mall'],
  'Nakuru': ['Westside Mall', 'Nakuru Mall'],
  'Eldoret': ['Rupa Mall', 'Zion Mall']
};

export function ShopForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = {}, 
  isLoading = false,
  isEditing = false
}: ShopFormProps) {
  const [formData, setFormData] = useState<Partial<ShopFormData>>({
    logo: '',
    name: '',
    industry: '',
    shopNumber: '',
    city: '',
    mall: '',
    whatsappNumber: '',
    ...initialData
  });
  
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData.logo || null);
  const [availableMalls, setAvailableMalls] = useState<string[]>([]);

  // Set available malls when city changes or on initial load
  useEffect(() => {
    if (formData.city) {
      setAvailableMalls(mallsByCity[formData.city] || []);
    }
  }, [formData.city]);

  // Handle city change
  const handleCityChange = (city: string) => {
    setFormData(prev => ({ ...prev, city, mall: '' }));
    setAvailableMalls(mallsByCity[city] || []);
  };

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoPreview(event.target.result as string);
          setFormData(prev => ({ ...prev, logo: file.name }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    // Add logo preview to form data
    const submitData = {
      ...formData,
      logo: logoPreview || '',
    } as ShopFormData;
    
    onSubmit(submitData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Shop Information' : 'Register Shop'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update your shop details below. Click save when you're done."
              : "Provide your shop details to register on TekeTeke."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center relative">
              {logoPreview ? (
                <Image 
                  src={logoPreview} 
                  alt="Logo preview" 
                  fill
                  sizes="128px"
                  objectFit="cover"
                  className="rounded-full"
                />
              ) : (
                <Upload className="h-8 w-8 text-gray-400" />
              )}
              
              <input
                type="file"
                id="logo-upload"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleLogoUpload}
              />
            </div>
            <Label htmlFor="logo-upload" className="cursor-pointer text-blue-600 text-sm">
              {logoPreview ? 'Change Logo' : 'Upload Logo'}
            </Label>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shop-name">Shop Name</Label>
              <Input 
                id="shop-name"
                placeholder="Enter shop name"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select 
                  value={formData.industry || ''} 
                  onValueChange={(value) => setFormData({...formData, industry: value})}
                >
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="shop-number">Shop Number</Label>
                <Input 
                  id="shop-number"
                  placeholder="e.g. A12"
                  value={formData.shopNumber || ''}
                  onChange={(e) => setFormData({...formData, shopNumber: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select 
                  value={formData.city || ''} 
                  onValueChange={handleCityChange}
                >
                  <SelectTrigger id="city">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mall">Mall</Label>
                <Select 
                  value={formData.mall || ''} 
                  onValueChange={(value) => setFormData({...formData, mall: value})}
                  disabled={!formData.city}
                >
                  <SelectTrigger id="mall">
                    <SelectValue placeholder={formData.city ? "Select mall" : "Select city first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMalls.map((mall) => (
                      <SelectItem key={mall} value={mall}>
                        {mall}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Business Number</Label>
              <Input 
                id="whatsapp"
                placeholder="+254 123456789"
                value={formData.whatsappNumber || ''}
                onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Register Shop'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
