-- Create signals table with exact structure matching Replit database
CREATE TABLE IF NOT EXISTS signals (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    trade_action VARCHAR(10) DEFAULT 'Buy',
    image_url TEXT,
    image_urls JSON,
    created_by INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert current signals including the NAS100 signal
INSERT INTO signals (id, title, content, trade_action, image_url, created_by, is_active, created_at, updated_at) VALUES
(1, 'EUR/USD Buy Signal', 'Strong bullish momentum on EUR/USD. Entry at 1.0850, Stop Loss at 1.0820, Take Profit at 1.0920. Risk-reward ratio 1:2.3', 'Buy', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200', 1, true, '2025-08-13 13:42:42.000', '2025-08-13 13:42:42.000'),
(2, 'GBP/JPY Sell Signal', 'Bearish reversal pattern confirmed on GBP/JPY. Entry at 165.50, Stop Loss at 166.00, Take Profit at 164.50. Watch for break below support.', 'Sell', 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200', 1, true, '2025-08-13 13:42:42.133', '2025-08-13 13:42:42.133'),
(3, 'USD/CHF Hold Position', 'Sideways consolidation on USD/CHF. Wait for clear breakout above 0.9200 or below 0.9100 before entering new positions.', 'Hold', 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200', 1, true, '2025-08-13 13:42:42.265', '2025-08-13 13:42:42.265'),
(4, 'nas100', 'Entry:
SL:
TP:', 'Buy', '', 1, true, '2025-08-14 08:33:08.364', '2025-08-14 08:33:08.364')
ON CONFLICT (id) DO NOTHING;

-- Update sequence to continue from correct ID
SELECT setval('signals_id_seq', 4, true);

-- Verify table creation and data
SELECT id, title, trade_action, is_active FROM signals ORDER BY created_at;