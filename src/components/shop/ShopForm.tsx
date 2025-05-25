'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'

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

interface City { id: string; name: string; }
interface Mall { id: string; name: string; city_id: string; }

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
  const [cities, setCities] = useState<City[]>([])
  const [malls, setMalls] = useState<Mall[]>([])
  const [logoFile, setLogoFile] = useState<File|null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [uploadingLogo, setUploadingLogo] = useState(false)

  // Fetch existing categories
  useEffect(() => {
    fetchCategories()
    fetchCities()
  }, [])

  useEffect(() => {
    if (formData.city) fetchMalls(formData.city)
    else setMalls([])
  }, [formData.city])

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

  const fetchCities = async () => {
    try {
      const res = await fetch('/api/cities')
      if (res.ok) setCities(await res.json())
    } catch (e) { console.error('Error fetching cities:', e) }
  }

  const fetchMalls = async (cityId: string) => {
    try {
      const res = await fetch(`/api/malls?city_id=${cityId}`)
      if (res.ok) setMalls(await res.json())
    } catch (e) { console.error('Error fetching malls:', e) }
  }

  const handleInputChange = (field: keyof ShopFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }


  // Logo upload logic
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      
      setLogoFile(file)
      const previewUrl = URL.createObjectURL(file)
      setLogoPreview(previewUrl)
      
      // Clean up previous preview URL
      return () => URL.revokeObjectURL(previewUrl)
    }
  }

  const uploadLogo = async () => {
    if (!logoFile) return ''
    setUploadingLogo(true)
    try {
      const supabase = createClient()
      const fileExt = logoFile.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `shop-logos/${fileName}`
      
      // First, try to create the bucket if it doesn't exist
      const { data: buckets } = await supabase.storage.listBuckets()
      const logosBucket = buckets?.find(bucket => bucket.name === 'logos')
      
      if (!logosBucket) {
        const { error: bucketError } = await supabase.storage.createBucket('logos', {
          public: true,
          allowedMimeTypes: ['image/*'],
          fileSizeLimit: 5242880 // 5MB
        })
        
        if (bucketError) {
          console.error('Error creating bucket:', bucketError)
          toast.error('Failed to create storage bucket')
          return ''
        }
      }
      
      const { data, error } = await supabase.storage.from('logos').upload(filePath, logoFile, {
        cacheControl: '3600',
        upsert: false
      })
      
      if (error) {
        console.error('Logo upload error:', error)
        toast.error(`Logo upload failed: ${error.message}`)
        return ''
      }
      
      const { data: urlData } = supabase.storage.from('logos').getPublicUrl(filePath)
      return urlData?.publicUrl || ''
    } catch (error) {
      console.error('Logo upload error:', error)
      toast.error('Logo upload failed')
      return ''
    } finally {
      setUploadingLogo(false)
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

    let logoUrl = formData.logo
    if (logoFile) logoUrl = await uploadLogo()
    await onSubmit({ ...formData, logo: logoUrl })
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
          {/* Logo upload */}
          <div className="flex flex-col items-center space-y-2">
            <label htmlFor="logo-upload" className="cursor-pointer flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-indigo-300 rounded-full bg-indigo-50 hover:bg-indigo-100">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="w-24 h-24 object-contain rounded-full" />
              ) : (
                <span className="text-indigo-400 text-4xl">+</span>
              )}
              <span className="text-xs text-indigo-700 mt-1">Upload Logo</span>
              <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </label>
            {uploadingLogo && <span className="text-xs text-gray-500">Uploading...</span>}
          </div>

          {/* Shop Name */}
          <div className="space-y-2">
            <Label htmlFor="shop_name">Shop Name *</Label>
            <Input 
              id="shop_name" 
              type="text" 
              value={formData.name} 
              onChange={e => handleInputChange('name', e.target.value)} 
              placeholder="Enter your shop name" 
              required 
            />
          </div>

          {/* Industry & Shop Number Row */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="industry">Industry *</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))} value={formData.industry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="shop_number">Shop Number *</Label>
              <Input id="shop_number" type="text" value={formData.shop_number} onChange={e => handleInputChange('shop_number', e.target.value)} placeholder="e.g., A-12, B-45" required />
            </div>
          </div>

          {/* City & Mall Row */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="city">City *</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, city: value, mall: '' }))} value={formData.city}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="mall">Mall/Location *</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, mall: value }))} value={formData.mall} disabled={!formData.city}>
                <SelectTrigger>
                  <SelectValue placeholder={formData.city ? 'Select a mall' : 'Select a city first'} />
                </SelectTrigger>
                <SelectContent>
                  {malls.map((mall) => (
                    <SelectItem key={mall.id} value={mall.id}>
                      {mall.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* WhatsApp Number */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp_number">WhatsApp Number *</Label>
            <Input id="whatsapp_number" type="tel" value={formData.whatsapp_number} onChange={e => handleInputChange('whatsapp_number', e.target.value)} placeholder="+254712345678" required />
            <p className="text-sm text-muted-foreground">Include country code (e.g., +254 for Kenya)</p>
          </div>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
            <Button type="submit" className="" disabled={isLoading || uploadingLogo}>
              {isLoading || uploadingLogo ? 'Registering...' : 'Register Shop'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
