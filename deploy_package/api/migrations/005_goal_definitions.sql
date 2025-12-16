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

-- Sample/Test Data for demonstration
INSERT INTO goal_definitions (site_id, goal_name, selector_type, selector_value) VALUES 
('TR-6374-J', 'WhatsApp Click', 'href_contains', 'wa.me'),
('TR-6374-J', 'Contact Form Submit', 'css_id', 'contact-submit-btn'),
('TR-6374-J', 'Purchase Button', 'text_contains', 'Satın Al');
