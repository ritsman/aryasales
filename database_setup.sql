-- database_setup.sql
-- Run this in your PostgreSQL database (gems)

-- Create the products_master table
CREATE TABLE IF NOT EXISTS products_master (
    id SERIAL PRIMARY KEY,
    style_number VARCHAR(100) NOT NULL UNIQUE,
    style_name VARCHAR(200) NOT NULL,
    season VARCHAR(100) NOT NULL,
    hsn_code VARCHAR(50) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    mrp DECIMAL(10,2) NOT NULL,
    size_set VARCHAR(100) NOT NULL,
    process_group VARCHAR(100) NOT NULL,
    item_bom VARCHAR(100) NOT NULL,
    picture_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_style_number ON products_master(style_number);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products_master(created_at);
CREATE INDEX IF NOT EXISTS idx_products_season ON products_master(season);

-- Optional: Create tables for the select options (recommended for production)

-- Size Sets table
CREATE TABLE IF NOT EXISTS size_sets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    value VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Process Groups table
CREATE TABLE IF NOT EXISTS process_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    value VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Item BOMs table
CREATE TABLE IF NOT EXISTS item_boms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    value VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for size_sets
INSERT INTO size_sets (name, value, description) VALUES
('Small Set (XS-S)', 'small_set', 'Extra Small to Small sizes'),
('Medium Set (M-L)', 'medium_set', 'Medium to Large sizes'),
('Large Set (L-XL)', 'large_set', 'Large to Extra Large sizes'),
('Extra Large Set (XL-XXL)', 'xl_set', 'Extra Large to Double Extra Large'),
('Full Range (XS-XXL)', 'full_range', 'Complete size range')
ON CONFLICT (value) DO NOTHING;

-- Insert sample data for process_groups
INSERT INTO process_groups (name, value, description) VALUES
('Manufacturing', 'manufacturing', 'Manufacturing and production processes'),
('Quality Control', 'quality_control', 'Quality assurance and testing'),
('Packaging', 'packaging', 'Packaging and labeling processes'),
('Distribution', 'distribution', 'Distribution and logistics'),
('Design & Development', 'design_dev', 'Design and product development')
ON CONFLICT (value) DO NOTHING;

-- Insert sample data for item_boms
INSERT INTO item_boms (name, value, description) VALUES
('Standard BOM', 'standard_bom', 'Standard bill of materials'),
('Premium BOM', 'premium_bom', 'Premium quality materials'),
('Economy BOM', 'economy_bom', 'Cost-effective materials'),
('Custom BOM', 'custom_bom', 'Customized bill of materials'),
('Luxury BOM', 'luxury_bom', 'High-end luxury materials')
ON CONFLICT (value) DO NOTHING;

--Product Stock table
CREATE TABLE IF NOT EXISTS products_stock (
    stock_id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products_master(id) ON DELETE CASCADE,
    size_label VARCHAR(50) NOT NULL,       -- e.g. "S", "M", "L" OR "1", "2", "3", "4"
    
    quantity INT NOT NULL CHECK (quantity >= 0), -- movement quantity
    
    movement_type VARCHAR(10) NOT NULL CHECK (movement_type IN ('CREDIT', 'DEBIT','INIT')),
        -- CREDIT = stock received
        -- DEBIT  = stock issued
        -- INIT   = initial stock setup
    
    reference_no VARCHAR(100),             -- receipt no / issue no
    movement_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 1. Fast lookup of stock by product + size (most common query)
CREATE INDEX idx_product_stock_product_size 
    ON products_stock (product_id, size_label);

-- 2. Fast filtering by product + date (for transaction history reports)
CREATE INDEX idx_product_stock_product_date 
    ON products_stock (product_id, movement_date);

-- 3. Optional: if you frequently search by reference_no (receipt/issue numbers)
CREATE INDEX idx_product_stock_reference 
    ON products_stock (reference_no);
-- 4. Optional: if you frequently filter by movement_type (CREDIT/DEBIT)
CREATE INDEX idx_product_stock_movement_type 
    ON products_stock (movement_type);