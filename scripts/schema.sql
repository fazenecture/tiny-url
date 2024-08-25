USE url_shortener;

-- Create the long_urls table
CREATE TABLE long_urls (
    id CHAR(36) PRIMARY KEY,
    url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME
);

-- Create the short_urls table with a foreign key reference to long_urls
CREATE TABLE short_urls (
    id CHAR(36) PRIMARY KEY,
    long_url_id CHAR(36),
    short_url_code VARCHAR(7) UNIQUE,
    click_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    FOREIGN KEY (long_url_id) REFERENCES long_urls(id)
);

-- Create the click_tracking table with a foreign key reference to short_urls
CREATE TABLE click_tracking (
    id CHAR(36) PRIMARY KEY,
    short_url_id CHAR(36),
    click_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    country_code CHAR(2),
    browser_details JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    FOREIGN KEY (short_url_id) REFERENCES short_urls(id)
);

-- Index on the short_url_code column for optimized lookups
CREATE INDEX idx_short_url_code ON short_urls(short_url_code);