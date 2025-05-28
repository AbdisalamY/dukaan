// src/components/shop/ShopForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import Image from 'next/image'
import { Upload, X } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LoadingStates } from '@/components/common/LoadingSpinner'
import { useIndustries, useCities, useMalls, useCreateShop, useUpdateShop } from '@/hooks/api-hooks'

const shopFormSchema = z.object({
  name: z.string().min(2, 'Shop name must be at least 2 characters'),
  industry: z.string().min(1, 'Please select an industry'),
  shopNumber: z.string().min(1, 'Shop number is required'),
  city: z.string().min(1, 'Please select a city'),
  mall: z.string().min(1, 'Please select a mall'),
  whatsappNumber: z.string().min(10, 'Please enter a valid WhatsApp number'),
  logo: z.string().optional(),
})

export type ShopFormData = z.infer<typeof shopFormSchema>

interface ShopFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ShopFormData) => void
  initialData?: Partial<ShopFormData & { id?: string }>
  isLoading?: boolean
  isEditing?: boolean
}

export function ShopForm({
  isOpen,
  onClose,
  initialData = {},
  isEditing = false,
}: ShopFormProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData.logo || null)
  const [selectedCity, setSelectedCity] = useState<string>(initialData.city || '')

  // React Query hooks
  const { data: industriesData, isLoading: industriesLoading } = useIndustries()
  const { data: citiesData, isLoading: citiesLoading } = useCities()
  const { data: mallsData, isLoading: mallsLoading } = useMalls(selectedCity)
  
  const createShopMutation = useCreateShop()
  const updateShopMutation = useUpdateShop()

  const form = useForm<ShopFormData>({
    resolver: zodResolver(shopFormSchema),
    defaultValues: {
      name: initialData.name || '',
      industry: initialData.industry || '',
      shopNumber: initialData.shopNumber || '',
      city: initialData.city || '',
      mall: initialData.mall || '',
      whatsappNumber: initialData.whatsappNumber || '',
      logo: initialData.logo || '',
    },
  })

  const isSubmitting = createShopMutation.isPending || updateShopMutation.isPending

  // Watch city changes to update malls
  const watchedCity = form.watch('city')
  
  useEffect(() => {
    if (watchedCity !== selectedCity) {
      setSelectedCity(watchedCity)
      // Reset mall selection when city changes
      if (form.getValues('mall')) {
        form.setValue('mall', '')
      }
    }
  }, [watchedCity, selectedCity, form])

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        form.setError('logo', { message: 'Please upload an image file' })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        form.setError('logo', { message: 'Image must be less than 5MB' })
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        setLogoPreview(result)
        form.setValue('logo', result)
        form.clearErrors('logo')
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoPreview(null)
    form.setValue('logo', '')
  }

  const onSubmit = async (data: ShopFormData) => {
    try {
      if (isEditing && initialData.id) {
        await updateShopMutation.mutateAsync({
          id: initialData.id,
          data,
        })
      } else {
        await createShopMutation.mutateAsync(data)
      }
      
      // Reset form and close dialog
      form.reset()
      setLogoPreview(null)
      setSelectedCity('')
      onClose()
    } catch (error) {
      // Error is handled by the mutation
      console.error('Shop form submission error:', error)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset()
      setLogoPreview(null)
      setSelectedCity('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Shop' : 'Register Your Shop'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update your shop information below.'
              : 'Fill in the details below to register your shop on Teke Teke.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Logo Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Shop Logo (Optional)</label>
              <div className="flex items-center space-x-4">
                {logoPreview ? (
                  <div className="relative">
                    <div className="w-20 h-20 relative rounded-lg overflow-hidden border">
                      <Image
                        src={logoPreview}
                        alt="Logo preview"
                        fill
                        sizes="80px"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      disabled={isSubmitting}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="flex-1"
                  disabled={isSubmitting}
                />
              </div>
              {form.formState.errors.logo && (
                <p className="text-sm text-red-500">{form.formState.errors.logo.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shop Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter shop name"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isSubmitting || industriesLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {industriesLoading ? (
                          <SelectItem value="" disabled>Loading industries...</SelectItem>
                        ) : (
                          industriesData?.industries?.map((industry: any) => (
                            <SelectItem key={industry.id} value={industry.name}>
                              {industry.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isSubmitting || citiesLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {citiesLoading ? (
                          <SelectItem value="" disabled>Loading cities...</SelectItem>
                        ) : (
                          citiesData?.cities?.map((city: any) => (
                            <SelectItem key={city.id} value={city.id}>
                              {city.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mall"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mall</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isSubmitting || mallsLoading || !selectedCity}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue 
                            placeholder={
                              !selectedCity 
                                ? "Select city first" 
                                : mallsLoading 
                                ? "Loading malls..." 
                                : "Select mall"
                            } 
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mallsLoading ? (
                          <SelectItem value="" disabled>Loading malls...</SelectItem>
                        ) : mallsData?.malls?.length === 0 ? (
                          <SelectItem value="" disabled>No malls found</SelectItem>
                        ) : (
                          mallsData?.malls?.map((mall: any) => (
                            <SelectItem key={mall.id} value={mall.id}>
                              {mall.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shopNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shop Number</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="e.g., A-12, G-34"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsappNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Number</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="+254 799 374937"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center">
                    <LoadingStates.Button size="sm" />
                    <span className="ml-2">
                      {isEditing ? 'Updating...' : 'Registering...'}
                    </span>
                  </div>
                ) : (
                  isEditing ? 'Update Shop' : 'Register Shop'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}