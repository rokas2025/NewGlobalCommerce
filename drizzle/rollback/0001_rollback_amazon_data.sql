-- Rollback script for Amazon product data table
-- This will remove the amazon_product_data table and all associated indexes

-- Drop indexes first (in reverse order of creation)
DROP INDEX IF EXISTS "amazon_product_data_feed_product_type_idx";
DROP INDEX IF EXISTS "amazon_product_data_browse_nodes_idx";
DROP INDEX IF EXISTS "amazon_product_data_listing_status_idx";
DROP INDEX IF EXISTS "amazon_product_data_updated_at_idx";
DROP INDEX IF EXISTS "amazon_product_data_created_at_idx";
DROP INDEX IF EXISTS "amazon_product_data_product_id_idx";
DROP INDEX IF EXISTS "amazon_product_data_amazon_sku_idx";

-- Drop the table
DROP TABLE IF EXISTS "amazon_product_data";

-- Note: This rollback script corresponds to migration 0001_wealthy_war_machine.sql
-- Run this script to completely remove the Amazon product data functionality 