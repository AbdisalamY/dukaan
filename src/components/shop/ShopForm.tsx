'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  description: string
}

interface ShopFormData {
  name: string
  logo: string
  industry: string
  shop_number: string
  city: string
  mall: string
  whatsapp_number: string
}

interface ShopFormProps {
  onSubmit: (data: ShopFormData) => Promise<void>
  isLoading?: boolean
}

export default function ShopForm({ onSubmit, isLoading = false }: ShopFormProps) {
  const [formData, setFormData] = useState<ShopFormData>({
    name: '',
    logo: '',
    industry: '',
    shop_number: '',
    city: '',
    mall: '',
    whatsapp_number: ''
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [customCategory, setCustomCategory] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)

  // Fetch existing categories
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleInputChange = (field: keyof ShopFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCategorySelect = (value: string) => {
    if (value === 'custom') {
      setShowCustomInput(true)
      setFormData(prev => ({ ...prev, industry: '' }))
    } else {
      setShowCustomInput(false)
      setCustomCategory('')
      setFormData(prev => ({ ...prev, industry: value }))
    }
  }

  const createCustomCategory = async () => {
    if (!customCategory.trim()) {
      toast.error('Please enter a category name')
      return
    }

    setIsCreatingCategory(true)
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: customCategory.trim()
        })
      })

      if (response.ok) {
        const newCategory = await response.json()
        
        // Update categories list
        setCategories(prev => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)))
        
        // Set the new category as selected
        setFormData(prev => ({ ...prev, industry: newCategory.name }))
        
        // Reset custom input
        setCustomCategory('')
        setShowCustomInput(false)
        
        toast.success(`Category "${newCategory.name}" created successfully!`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create category')
      }
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('Failed to create category')
    } finally {
      setIsCreatingCategory(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Shop name is required')
      return
    }
    
    if (!formData.industry.trim()) {
      toast.error('Please select or create a category')
      return
    }
    
    if (!formData.shop_number.trim()) {
      toast.error('Shop number is required')
      return
    }
    
    if (!formData.city.trim()) {
      toast.error('City is required')
      return
    }
    
    if (!formData.mall.trim()) {
      toast.error('Mall is required')
      return
    }
    
    if (!formData.whatsapp_number.trim()) {
      toast.error('WhatsApp number is required')
      return
    }

    await onSubmit(formData)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Register Your Shop</CardTitle>
        <CardDescription>
          Fill in the details below to register your shop on our platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Shop Name *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your shop name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo URL (Optional)</Label>
            <Input
              id="logo"
              type="url"
              value={formData.logo}
              onChange={(e) => handleInputChange('logo', e.target.value)}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Category *</Label>
            {!showCustomInput ? (
              <Select onValueChange={handleCategorySelect} value={formData.industry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category or create new" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">+ Create New Category</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter new category name"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      createCustomCategory()
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={createCustomCategory}
                  disabled={isCreatingCategory}
                  size="sm"
                >
                  {isCreatingCategory ? 'Creating...' : 'Create'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCustomInput(false)
                    setCustomCategory('')
                  }}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shop_number">Shop Number *</Label>
            <Input
              id="shop_number"
              type="text"
              value={formData.shop_number}
              onChange={(e) => handleInputChange('shop_number', e.target.value)}
              placeholder="e.g., A-12, B-45"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Enter your city"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mall">Mall/Location *</Label>
            <Input
              id="mall"
              type="text"
              value={formData.mall}
              onChange={(e) => handleInputChange('mall', e.target.value)}
              placeholder="Enter mall or location name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp_number">WhatsApp Number *</Label>
            <Input
              id="whatsapp_number"
              type="tel"
              value={formData.whatsapp_number}
              onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
              placeholder="+254712345678"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register Shop'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
