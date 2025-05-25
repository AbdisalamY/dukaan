import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error in categories GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { name, description } = await request.json()

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    // Normalize the category name (trim, lowercase for comparison)
    const normalizedName = name.trim()
    const searchName = normalizedName.toLowerCase()

    // Check if category already exists (case-insensitive)
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('*')
      .ilike('name', searchName)
      .single()

    if (existingCategory) {
      // Return the existing category instead of creating a duplicate
      return NextResponse.json(existingCategory)
    }

    // Create new category with proper capitalization
    const categoryName = normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1).toLowerCase()
    
    const { data: newCategory, error } = await supabase
      .from('categories')
      .insert([
        {
          name: categoryName,
          description: description || `${categoryName} products and services`
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
    }

    return NextResponse.json(newCategory, { status: 201 })
  } catch (error) {
    console.error('Error in categories POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
