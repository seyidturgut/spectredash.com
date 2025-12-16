-- SPECTRE ANALYTICS FULL SCHEMA
-- Run this SQL in phpMyAdmin to set up the database structure.

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- 1. Sites Table
CREATE TABLE IF NOT EXISTS sites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    site_id VARCHAR(50) NOT NULL UNIQUE,
    domain VARCHAR(255) NOT NULL,
    allowed_domains TEXT,
    rate_limit INT DEFAULT 100,
    heatmap_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Visitors (Ziyaretler) Table
CREATE TABLE IF NOT EXISTS ziyaretler (
    id INT AUTO_INCREMENT PRIMARY KEY,
    site_id VARCHAR(50) NOT NULL,
    session_id VARCHAR(100),
    url VARCHAR(500),
    page_title VARCHAR(255) DEFAULT NULL,
    referrer VARCHAR(500),
    ip_address VARCHAR(45),
    device VARCHAR(50),
    browser VARCHAR(50),
    os VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    is_bot BOOLEAN DEFAULT FALSE,
    page_load_time INT,
    viewport_width INT,
    viewport_height INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_site_date (site_id, created_at),
    INDEX idx_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 3. Sessions (Oturumlar) Table
CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    site_id VARCHAR(50) NOT NULL,
    session_id VARCHAR(100) NOT NULL UNIQUE,
    first_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    page_views INT DEFAULT 1,
    is_bot BOOLEAN DEFAULT FALSE,
    device VARCHAR(20),
    
    INDEX idx_site_session (site_id, session_id),
    INDEX idx_last_activity (last_activity),
    INDEX idx_is_bot (is_bot)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 4. Goals (Hedefler) Table
CREATE TABLE IF NOT EXISTS goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    site_id VARCHAR(50) NOT NULL,
    session_id VARCHAR(100),
    goal_name VARCHAR(100) NOT NULL,
    goal_value DECIMAL(10,2) DEFAULT 0,
    metadata JSON,
    url VARCHAR(500),
    page_title VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_site_goal (site_id, goal_name),
    INDEX idx_session (session_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 5. Events (Olaylar) Table
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    site_id VARCHAR(50) NOT NULL,
    session_id VARCHAR(100),
    event_name VARCHAR(100) NOT NULL,
    event_category VARCHAR(50) DEFAULT 'general',
    event_label VARCHAR(100),
    event_value INT DEFAULT 0,
    metadata JSON,
    url VARCHAR(500),
    page_title VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_site_event (site_id, event_name),
    INDEX idx_session (session_id),
    INDEX idx_category (event_category),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 6. Heatmap Data Table
CREATE TABLE IF NOT EXISTS heatmap_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    site_id VARCHAR(50) NOT NULL,
    session_id VARCHAR(100),
    url VARCHAR(500) NOT NULL,
    page_title VARCHAR(255) DEFAULT NULL,
    interaction_type ENUM('click', 'scroll', 'movement') NOT NULL,
    x_position INT,
    y_position INT,
    scroll_depth INT,
    viewport_width INT,
    viewport_height INT,
    element_tag VARCHAR(50),
    element_id VARCHAR(100),
    element_class VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_site_url (site_id, url(255)),
    INDEX idx_type (interaction_type),
    INDEX idx_session (session_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 7. Goal Definitions (Hedef Tanımları) Table
CREATE TABLE IF NOT EXISTS goal_definitions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    site_id VARCHAR(50) NOT NULL,
    goal_name VARCHAR(100) NOT NULL,
    event_type ENUM('click', 'visibility') DEFAULT 'click',
    selector_type ENUM('css_class', 'css_id', 'text_contains', 'href_contains') NOT NULL,
    selector_value VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_site_active (site_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Users / Customers Table
-- Note: Assuming a 'users' table exists for authentication. If not, create it here.
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    contact_name VARCHAR(255),
    domain VARCHAR(255),
    site_id VARCHAR(50) UNIQUE,
    role ENUM('admin', 'customer') DEFAULT 'customer',
    is_suspended BOOLEAN DEFAULT FALSE,
    last_active_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SAMPLE DATA
INSERT INTO goal_definitions (site_id, goal_name, selector_type, selector_value) VALUES 
('TR-6374-J', 'WhatsApp Click', 'href_contains', 'wa.me'),
('TR-6374-J', 'Contact Form Submit', 'css_id', 'contact-submit-btn'),
('TR-6374-J', 'Purchase Button', 'text_contains', 'Satın Al');
