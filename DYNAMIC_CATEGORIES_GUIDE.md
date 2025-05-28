# Dynamic Categories System

## Overview

The dukaan marketplace now features a dynamic category system that allows shop owners to create their own categories instead of being limited to predefined options. This provides maximum flexibility while building a comprehensive category directory over time.

## How It Works

### For Shop Owners

1. **Selecting Existing Categories**: When registering a shop, owners can choose from existing categories in the dropdown
2. **Creating New Categories**: If their business doesn't fit existing categories, they can select "Create New Category" and input a custom category name
3. **Automatic Addition**: New categories are immediately added to the system and become available for future shop owners

### For the System

- **Duplicate Prevention**: The system prevents duplicate categories using case-insensitive matching
- **Auto-formatting**: Category names are automatically formatted with proper capitalization
- **Instant Availability**: New categories become immediately available in the dropdown for other shop owners

## Current Categories

As of implementation, the system includes these example categories:

- Books
- Cosmetics
- Electronics
- Fashion
- Jewelry
- Sports

## Technical Implementation

### Database Schema

- Categories table with unique constraint on lowercase names
- Automatic description generation for new categories
- Timestamps for tracking category creation

### API Endpoints

- `GET /api/categories` - Fetch all categories
- `POST /api/categories` - Create new category (with duplicate checking)

### Frontend Features

- Dynamic dropdown with existing categories
- Custom input field for new categories
- Real-time category creation
- User feedback via toast notifications

## Benefits

1. **Flexibility**: Shop owners aren't limited by predefined categories
2. **Growth**: The category system grows organically with the marketplace
3. **User Experience**: Seamless category creation without admin intervention
4. **Data Quality**: Duplicate prevention ensures clean category data

## Example Workflow

1. Shop owner "Alice" wants to register a "Handmade Crafts" shop
2. She doesn't see this category in the dropdown
3. She selects "Create New Category" and types "Handmade Crafts"
4. The system creates the category and selects it for her shop
5. Shop owner "Bob" later sees "Handmade Crafts" in the dropdown and can select it

## Future Enhancements

- Category merging by admins
- Category descriptions editing
- Category usage statistics
- Category suggestions based on shop names
