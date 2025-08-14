// Placeholder image API function
export const handler = async (event, context) => {
  const headers = {
    'Content-Type': 'image/svg+xml',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Cache-Control': 'public, max-age=86400'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { ...headers, 'Content-Type': 'text/plain' }, body: '' };
  }

  try {
    // Extract dimensions from path like /api/placeholder/400/300
    const pathParts = event.path.split('/');
    const width = pathParts[pathParts.length - 2] || '400';
    const height = pathParts[pathParts.length - 1] || '300';

    // Generate SVG placeholder
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <rect x="20%" y="35%" width="60%" height="10%" fill="#d1d5db"/>
      <rect x="20%" y="50%" width="40%" height="8%" fill="#d1d5db"/>
      <circle cx="30%" cy="25%" r="5%" fill="#d1d5db"/>
      <text x="50%" y="75%" text-anchor="middle" fill="#6b7280" font-family="Arial, sans-serif" font-size="14">
        Chart Placeholder ${width}x${height}
      </text>
    </svg>`.trim();

    return {
      statusCode: 200,
      headers,
      body: svg
    };

  } catch (error) {
    console.error('Error generating placeholder:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: 'Error generating placeholder',
        error: error.message 
      })
    };
  }
};