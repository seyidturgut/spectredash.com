
-- 9. Heatmap Pages (Snapshot System)
CREATE TABLE IF NOT EXISTS heatmap_pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    site_id VARCHAR(50) NOT NULL,
    url VARCHAR(500) NOT NULL,
    device VARCHAR(20) DEFAULT 'Desktop',
    screenshot_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_site_url (site_id, url(255))
);
