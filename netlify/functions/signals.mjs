// Signals API function
export const handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Return trading signals from your database
    const signals = [
      {
        id: 1,
        title: "EUR/USD Buy Signal",
        description: "Strong bullish momentum on EUR/USD with key support at 1.0850. Target 1.0920 with stop loss at 1.0830.",
        content: "Strong bullish momentum on EUR/USD with key support at 1.0850. Target 1.0920 with stop loss at 1.0830.",
        currencyPair: "EUR/USD",
        signal: "BUY",
        tradeAction: "BUY",
        entryPrice: "1.0875",
        stopLoss: "1.0830", 
        takeProfit: "1.0920",
        status: "active",
        imageUrls: ["/api/placeholder/400/300"],
        createdAt: "2025-08-13T13:42:41.739Z",
        updatedAt: "2025-08-13T13:42:41.739Z"
      },
      {
        id: 2,
        title: "GBP/JPY Sell Signal",
        description: "Bearish reversal pattern on GBP/JPY. Strong resistance at 190.50. Target 188.80 with stop loss at 191.20.",
        content: "Bearish reversal pattern on GBP/JPY. Strong resistance at 190.50. Target 188.80 with stop loss at 191.20.",
        currencyPair: "GBP/JPY",
        signal: "SELL",
        tradeAction: "SELL",
        entryPrice: "190.25",
        stopLoss: "191.20",
        takeProfit: "188.80", 
        status: "active",
        imageUrls: ["/api/placeholder/400/300"],
        createdAt: "2025-08-13T13:42:41.875Z",
        updatedAt: "2025-08-13T13:42:41.875Z"
      },
      {
        id: 3,
        title: "USD/CAD Buy Signal",
        description: "Bullish breakout on USD/CAD above key resistance. Target 1.3650 with stop loss at 1.3520.",
        content: "Bullish breakout on USD/CAD above key resistance. Target 1.3650 with stop loss at 1.3520.",
        currencyPair: "USD/CAD", 
        signal: "BUY",
        tradeAction: "BUY",
        entryPrice: "1.3580",
        stopLoss: "1.3520",
        takeProfit: "1.3650",
        status: "closed",
        imageUrls: ["/api/placeholder/400/300"],
        createdAt: "2025-08-13T13:42:42.011Z",
        updatedAt: "2025-08-13T13:42:42.011Z"
      },
      {
        id: 4,
        title: "AUD/USD Sell Signal", 
        description: "Bearish trend continuation on AUD/USD. Key resistance at 0.6750. Target 0.6680 with stop loss at 0.6780.",
        content: "Bearish trend continuation on AUD/USD. Key resistance at 0.6750. Target 0.6680 with stop loss at 0.6780.",
        currencyPair: "AUD/USD",
        signal: "SELL",
        tradeAction: "SELL", 
        entryPrice: "0.6720",
        stopLoss: "0.6780",
        takeProfit: "0.6680",
        status: "active",
        imageUrls: ["/api/placeholder/400/300"],
        createdAt: "2025-08-13T13:42:42.147Z",
        updatedAt: "2025-08-13T13:42:42.147Z"
      }
    ];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(signals)
    };
  } catch (error) {
    console.error('Signals API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error', error: error.message })
    };
  }
};