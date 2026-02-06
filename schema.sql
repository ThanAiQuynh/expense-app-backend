-- Database Schema Design - Expense Management Application (PostgreSQL)

-- 0. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enums
CREATE TYPE transaction_type AS ENUM ('expense', 'income', 'transfer');
CREATE TYPE category_type AS ENUM ('expense', 'income');
CREATE TYPE payment_method_type AS ENUM ('cash', 'card', 'bank', 'ewallet');
CREATE TYPE budget_period AS ENUM ('daily', 'weekly', 'monthly', 'yearly', 'custom');
CREATE TYPE recurring_frequency AS ENUM ('daily', 'weekly', 'monthly', 'yearly');
CREATE TYPE goal_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE social_provider AS ENUM ('google', 'facebook', 'apple', 'github');

-- 2. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    currency VARCHAR(10) DEFAULT 'VND',
    language VARCHAR(5) DEFAULT 'vi',
    
    -- Settings stored as JSONB for flexibility
    settings JSONB DEFAULT '{
        "date_format": "DD/MM/YYYY",
        "start_of_week": 1,
        "notifications": {
            "email": true,
            "budget": true,
            "recurring": true
        }
    }'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- 2.1 Roles Table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.2 User Roles Mapping
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- 2.3 User Sessions (for Refresh Tokens and Revocation)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    jti UUID UNIQUE NOT NULL, -- JWT ID for tracking specific tokens
    refresh_token TEXT UNIQUE NOT NULL,
    device_info TEXT,
    ip_address VARCHAR(45),
    is_revoked BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.4 Social Accounts (OAuth)
CREATE TABLE social_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider social_provider NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    provider_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (provider, provider_user_id)
);

-- 2.5 Groups (for Shared Wallets / Family / Team)
-- We include this now to make the code "Group-Aware" from day one.
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id),
    color VARCHAR(20),
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.6 Group Members
CREATE TABLE group_members (
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- 'admin', 'member', 'viewer'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, user_id)
);

-- 3. Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL, -- Added for Shared Wallet support
    name VARCHAR(100) NOT NULL,
    type category_type NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(20),
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique category names per user OR group
    UNIQUE (user_id, group_id, name, type)
);

-- 4. Payment Methods Table
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL, -- Added for Shared Wallet support
    name VARCHAR(100) NOT NULL,
    type payment_method_type NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(20),
    
    last_four_digits VARCHAR(4),
    bank_name VARCHAR(255),
    
    initial_balance DECIMAL(15, 2) DEFAULT 0.00,
    current_balance DECIMAL(15, 2) DEFAULT 0.00,
    include_in_total BOOLEAN DEFAULT true,
    
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Recurring Transactions Table
-- (Created before transactions so transactions can reference it)
CREATE TABLE recurring_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL, -- Added for Shared Wallet support
    category_id UUID NOT NULL REFERENCES categories(id),
    payment_method_id UUID NOT NULL REFERENCES payment_methods(id),
    
    type category_type NOT NULL,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) DEFAULT 'VND',
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    frequency recurring_frequency NOT NULL,
    interval_value INTEGER DEFAULT 1, -- every X days/weeks/months/years
    
    start_date DATE NOT NULL,
    end_date DATE,
    end_after_occurrences INTEGER,
    
    next_occurrence TIMESTAMP WITH TIME ZONE,
    last_occurrence TIMESTAMP WITH TIME ZONE,
    
    auto_create BOOLEAN DEFAULT true,
    reminder_days INTEGER DEFAULT 0,
    
    is_active BOOLEAN DEFAULT true,
    is_paused BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Transactions Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL, -- Added for Shared Wallet support
    category_id UUID NOT NULL REFERENCES categories(id),
    payment_method_id UUID NOT NULL REFERENCES payment_methods(id),
    to_payment_method_id UUID REFERENCES payment_methods(id), -- for transfers
    
    type transaction_type NOT NULL,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) DEFAULT 'VND',
    
    description TEXT,
    notes TEXT,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    location_name VARCHAR(255),
    location_address TEXT,
    location_coords POINT, -- PostgreSQL point type (lat, lng)
    
    -- Files/receipts stored as JSONB for metadata + URLs
    attachments JSONB DEFAULT '[]'::jsonb,
    
    recurring_id UUID REFERENCES recurring_transactions(id) ON DELETE SET NULL,
    
    tags TEXT[], -- Array of strings
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Budgets Table
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL, -- Added for Shared Wallet support
    category_id UUID REFERENCES categories(id), -- NULL means overall budget
    
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) DEFAULT 'VND',
    
    period budget_period NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    is_recurring BOOLEAN DEFAULT true,
    
    alert_threshold DECIMAL(5, 2) DEFAULT 80.00, -- alert at 80%
    alert_enabled BOOLEAN DEFAULT true,
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Goals Table
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_amount DECIMAL(15, 2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(15, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'VND',
    
    target_date DATE,
    
    icon VARCHAR(50),
    color VARCHAR(20),
    image_url TEXT,
    
    status goal_status DEFAULT 'active',
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 9. Indexes for Performance
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_payment_method ON transactions(payment_method_id);
CREATE INDEX idx_recurring_next_occurrence ON recurring_transactions(next_occurrence) WHERE is_active = true AND is_paused = false;
CREATE INDEX idx_budgets_user_period ON budgets(user_id, start_date, end_date);
CREATE INDEX idx_budgets_group ON budgets(group_id) WHERE group_id IS NOT NULL;
CREATE INDEX idx_goals_user_status ON goals(user_id, status);
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(refresh_token);
CREATE INDEX idx_sessions_jti ON user_sessions(jti);
CREATE INDEX idx_social_user ON social_accounts(user_id);
CREATE INDEX idx_groups_owner ON groups(owner_id);
CREATE INDEX idx_transactions_group ON transactions(group_id) WHERE group_id IS NOT NULL;

-- 10. Triggers for updated_at
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_recurring_transactions_updated_at BEFORE UPDATE ON recurring_transactions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 11. Sample Data (Optional)
-- Insert some default categories
-- INSERT INTO categories (name, type, icon, color, is_default) VALUES 
-- ('Food & Dining', 'expense', 'utensils', '#FF5733', true),
-- ('Transportation', 'expense', 'car', '#3357FF', true),
-- ('Salary', 'income', 'money-bill-wave', '#2ECC71', true);
