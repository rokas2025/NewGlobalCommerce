# Product Requirements Document: Amazon Import Feature

## Executive Summary

### Problem Statement
Global Commerce users need the ability to import product data from Amazon Category Listings Reports to streamline their product catalog management and leverage existing Amazon product data for their e-commerce operations.

### Solution Overview
Implement a comprehensive Amazon Import feature that allows users to:
1. Upload and analyze Amazon Category Listings Report Excel files
2. Preview and select products for import
3. Map Amazon fields to Global Commerce database schema
4. Import selected products with all relevant data
5. Export products back to Amazon-compatible format

### Success Metrics
- 95% successful import rate for valid Amazon product data
- <30 seconds processing time for files with up to 1000 products
- 100% field mapping accuracy for core product attributes
- User satisfaction score >4.5/5 for import workflow

## Amazon Category Listings Report Analysis

### File Structure
Based on analysis of `Category+Listings+Report+06-09-2025.xlsm`, the file contains:

#### Sheet Overview
1. **Instructions** - User guidance (63 rows, 469 columns)
2. **Images** - Image-related information  
3. **Example** - Sample data for reference
4. **Data Definitions** - Field definitions (175 rows, 7 columns)
5. **Dropdown Lists** - Valid values for fields (546 rows, 81 columns)
6. **AttributePTDMAP** - Product type mapping (268 rows, 3 columns)
7. **Template** - **PRIMARY DATA SHEET** (33 rows, 268 columns)
8. **Conditions List** - Condition values (13 rows, 3 columns)
9. **Valid Values** - Field validation data (88 rows, 546 columns)

#### Key Data Sheet: Template
- **Row 1**: Metadata and configuration
- **Row 2**: Human-readable column headers
- **Row 3**: Technical field names (API identifiers)
- **Row 4+**: Product data entries

### Critical Amazon Fields Identified

#### Core Product Information
- `item_sku` - Seller SKU (maps to `sku`)
- `item_name` / `::title` - Product title (maps to `name`)
- `product_description` - Full description (maps to `description`)
- `brand_name` - Brand (maps to `brand` in attributes)
- `external_product_id` - GTIN/EAN/UPC (maps to `barcode`)
- `external_product_id_type` - ID type (GTIN/EAN/UPC)

#### Images
- `main_image_url` - Primary image (maps to first item in `images` array)
- `other_image_url1` through `other_image_url8` - Additional images
- `swatch_image_url` - Color swatch image

#### Pricing & Inventory
- Multiple pricing fields for different marketplaces
- `list_price_with_tax` - List price
- `minimum_seller_allowed_price` - Minimum price
- `maximum_seller_allowed_price` - Maximum price

#### Physical Attributes
- `item_weight` + `item_weight_unit_of_measure` - Weight
- `item_length` + `item_length_unit_of_measure` - Length
- `item_width` + `item_width_unit_of_measure` - Width  
- `item_height` + `item_height_unit_of_measure` - Height
- `package_weight` + `package_weight_unit_of_measure` - Package weight

#### Product Features
- `bullet_point1` through `bullet_point5` - Key features
- `generic_keywords` - Search terms (maps to `tags`)
- `color_name` - Color
- `size_name` - Size
- `material_type` - Material
- `style_name` - Style

#### Amazon-Specific Fields
- `feed_product_type` - Amazon product type
- `recommended_browse_nodes` - Category classification
- `::listing_status` - Product status
- `parent_child` - Variation relationship
- `variation_theme` - Variation type

## Database Schema Integration

### Existing Schema Analysis
Current `products` table supports:
- ✅ Basic info: `name`, `slug`, `description`, `sku`, `barcode`
- ✅ Pricing: `price`, `compareAtPrice`, `costPrice`
- ✅ Images: `images` (JSON array)
- ✅ Attributes: `attributes` (JSON object)
- ✅ Dimensions: `dimensions` (JSON object)
- ✅ Tags: `tags` (JSON array)
- ✅ Weight: `weight`
- ✅ Status: `status`

### Required Schema Extensions

#### New Table: `amazon_product_data`
```sql
CREATE TABLE amazon_product_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  amazon_sku TEXT NOT NULL,
  amazon_asin TEXT,
  feed_product_type TEXT,
  browse_nodes TEXT[],
  listing_status TEXT,
  parent_child TEXT,
  variation_theme TEXT,
  marketplace_data JSONB DEFAULT '{}',
  bullet_points TEXT[],
  search_terms TEXT[],
  amazon_attributes JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Feature Requirements

### 1. File Upload & Analysis

#### 1.1 File Upload Interface
- **Requirement**: Support `.xlsm` and `.xlsx` file uploads up to 50MB
- **Validation**: Verify file structure matches Amazon Category Listings Report format
- **Error Handling**: Clear error messages for invalid files
- **Progress**: Upload progress indicator

#### 1.2 File Analysis Engine
- **Sheet Detection**: Automatically identify Template sheet with product data
- **Column Mapping**: Map Amazon field names to database schema
- **Data Validation**: Validate required fields and data types
- **Statistics**: Show total products, valid entries, errors

### 2. Product Preview & Selection

#### 2.1 Product Grid View
- **Display**: Paginated grid showing key product information
- **Columns**: SKU, Title, Brand, Price, Images, Status
- **Selection**: Multi-select checkboxes for import choice
- **Filtering**: Filter by brand, price range, status
- **Search**: Search by SKU, title, or description

#### 2.2 Product Detail Modal
- **Full Preview**: Complete product information display
- **Image Gallery**: All product images with zoom
- **Field Mapping**: Show Amazon field → Database field mapping
- **Validation Status**: Highlight any data issues

### 3. Import Configuration

#### 3.1 Field Mapping Interface
- **Automatic Mapping**: Pre-configured mapping for standard fields
- **Custom Mapping**: Allow users to adjust field mappings
- **Preview**: Show how data will be stored in database
- **Validation**: Ensure all required fields are mapped

#### 3.2 Import Options
- **Duplicate Handling**: Skip, overwrite, or create new for existing SKUs
- **Category Assignment**: Assign imported products to categories
- **Status Setting**: Set initial product status (draft/active)
- **Batch Size**: Configure import batch size for performance

### 4. Import Processing

#### 4.1 Background Processing
- **Queue System**: Process imports in background queue
- **Progress Tracking**: Real-time progress updates
- **Error Handling**: Graceful error handling with detailed logs
- **Notifications**: Email/in-app notifications on completion

#### 4.2 Data Transformation
- **Image Processing**: Download and store images locally
- **Unit Conversion**: Convert measurements to standard units
- **Price Formatting**: Format prices according to system settings
- **Slug Generation**: Generate URL-friendly slugs

### 5. Export Functionality

#### 5.1 Product Selection for Export
- **Product List**: Show all products with Amazon data
- **Filtering**: Filter by import date, status, category
- **Selection**: Multi-select for export
- **Preview**: Preview export data before generation

#### 5.2 Excel Export Generation
- **Format**: Generate Amazon-compatible Excel file
- **Template**: Use same structure as Category Listings Report
- **Field Mapping**: Reverse mapping from database to Amazon fields
- **Download**: Direct download of generated file

## Technical Implementation

### 1. Backend APIs

#### 1.1 Upload & Analysis API
```typescript
POST /api/amazon/upload
POST /api/amazon/analyze/:fileId
GET /api/amazon/preview/:fileId
```

#### 1.2 Import API
```typescript
POST /api/amazon/import
GET /api/amazon/import/status/:jobId
GET /api/amazon/import/history
```

#### 1.3 Export API
```typescript
POST /api/amazon/export
GET /api/amazon/export/download/:exportId
```

### 2. Database Migration
```sql
-- Create amazon_product_data table
-- Add indexes for performance
-- Update existing products table if needed
```

### 3. File Processing
- **Library**: Use `xlsx` package for Excel processing
- **Storage**: Store uploaded files in secure temporary storage
- **Cleanup**: Automatic cleanup of temporary files

### 4. Background Jobs
- **Queue**: Implement job queue for import processing
- **Workers**: Background workers for file processing
- **Monitoring**: Job status tracking and monitoring

## Deployment Plan

### Phase 1: Core Import (Week 1-2)
- File upload and analysis
- Basic product preview
- Simple import functionality
- Database schema updates

### Phase 2: Enhanced Features (Week 3-4)
- Advanced field mapping
- Product selection interface
- Error handling improvements
- Background job processing

### Phase 3: Export & Polish (Week 5-6)
- Export functionality
- UI/UX improvements
- Performance optimizations
- Comprehensive testing

## Success Criteria

### 1. Functional Requirements
- ✅ Successfully parse Amazon Category Listings Report
- ✅ Import products with 95% accuracy
- ✅ Handle files up to 50MB
- ✅ Export products in Amazon-compatible format

### 2. Performance Requirements
- ✅ Process 1000 products in <2 minutes
- ✅ Support concurrent imports
- ✅ Maintain system responsiveness during imports

### 3. User Experience
- ✅ Intuitive import workflow
- ✅ Clear error messages and guidance
- ✅ Progress indicators for long operations
- ✅ Responsive design for all screen sizes

## Conclusion

The Amazon Import feature will significantly enhance Global Commerce by enabling users to efficiently import and manage Amazon product data. [[memory:2159790]] The comprehensive approach outlined in this PRD ensures a robust, scalable, and user-friendly implementation that leverages the existing database schema while extending it appropriately for Amazon-specific requirements.

The phased development approach allows for iterative improvements and early user feedback, ensuring the final implementation meets all user needs and business requirements.
