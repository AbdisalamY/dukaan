// src/app/shop/dashboard/page.tsx
'use client'

import { useState } from 'react'
import { StoreIcon, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShopForm } from '@/components/shop/ShopForm'
import { ShopCard } from '@/components/shop/ShopCard'
import { LoadingStates } from '@/components/common/LoadingSpinner'
import { useUserShops } from '@/hooks/api-hooks'
import { useAuth } from '@/stores/auth-store'

export default function DashboardPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingShop, setEditingShop] = useState<any>(null)
  
  const { user } = useAuth()
  const { data: shopsData, isLoading, error } = useUserShops()
  
  const userShops = shopsData?.shops || []
  const hasShops = userShops.length > 0

  const handleEditShop = (shop: any) => {
    setEditingShop(shop)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingShop(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Shop Dashboard</h1>
        </div>
        <LoadingStates.Card text="Loading your shops..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Shop Dashboard</h1>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">Failed to load your shops</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Shop Dashboard</h1>
        {hasShops && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Shop
          </Button>
        )}
      </div>

      {!hasShops ? (
        // No shops registered yet
        <Card className="border-dashed border-2 hover:border-blue-400 transition-colors">
          <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px]">
            <StoreIcon className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium mb-2">No Shop Registered</h3>
            <p className="text-gray-500 text-center mb-6 max-w-md">
              Register your shop to start selling on TekeTeke. Add your shop information to get started.
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Register Shop
            </Button>
          </CardContent>
        </Card>
      ) : (
        // Display user's shops
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {userShops.map((shop: any) => (
            <ShopCard 
              key={shop.id}
              shop={shop} 
              onEdit={() => handleEditShop(shop)} 
            />
          ))}
        </div>
      )}

      {/* Shop Form Dialog */}
      <ShopForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={() => {}} // Handled by the mutation in ShopForm
        initialData={editingShop}
        isEditing={!!editingShop}
      />
    </div>
  )
}