'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ShopForm from '@/components/shop/ShopForm'
import { toast } from 'sonner'

interface ShopFormData {
  name: string
  logo: string
  industry: string
  shop_number: string
  city: string
  mall: string
  whatsapp_number: string
}

export default function ShopDashboard() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleShopSubmit = async (data: ShopFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/shops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const shop = await response.json()
        toast.success('Shop registered successfully! Awaiting admin approval.')
        router.push('/shop/payments')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to register shop')
      }
    } catch (error) {
      console.error('Error registering shop:', error)
      toast.error('Failed to register shop')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-2">
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold">Shop Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Register your shop to start accepting payments and managing your business
        </p>
      </div>
      
      <ShopForm onSubmit={handleShopSubmit} isLoading={isLoading} />
    </div>
  )
}
