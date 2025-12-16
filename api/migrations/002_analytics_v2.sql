
CREATE TABLE IF NOT EXISTS goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    site_id VARCHAR(50) NOT NULL,
    session_id VARCHAR(100),
    goal_name VARCHAR(100) NOT NULL,
    goal_value DECIMAL(10,2) DEFAULT 0,
    metadata JSON,
    url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_site_goal (site_id, goal_name),
    INDEX idx_session (session_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_site_event (site_id, event_name),
    INDEX idx_session (session_id),
    INDEX idx_category (event_category),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS heatmap_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    site_id VARCHAR(50) NOT NULL,
    session_id VARCHAR(100),
    url VARCHAR(500) NOT NULL,
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

ALTER TABLE ziyaretler 
ADD COLUMN IF NOT EXISTS session_id VARCHAR(100) AFTER site_id,
ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT FALSE AFTER device,
ADD COLUMN IF NOT EXISTS page_load_time INT AFTER is_bot,
ADD COLUMN IF NOT EXISTS viewport_width INT AFTER page_load_time,
ADD COLUMN IF NOT EXISTS viewport_height INT AFTER viewport_width,
ADD INDEX IF NOT EXISTS idx_session (session_id);

ALTER TABLE sites 
ADD COLUMN IF NOT EXISTS allowed_domains TEXT AFTER domain,
ADD COLUMN IF NOT EXISTS rate_limit INT DEFAULT 100 AFTER allowed_domains,
ADD COLUMN IF NOT EXISTS heatmap_enabled BOOLEAN DEFAULT TRUE AFTER rate_limit;
