// src/types/shop.ts
export interface Shop {
  id: number;
  name: string;
  owner: string;
  logo: string;
  industry: string;
  shopNumber: string;
  city: string;
  mall: string;
  whatsappNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
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