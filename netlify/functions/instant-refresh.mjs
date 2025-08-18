// Ultra-aggressive cache-busting solution for immediate UI updates
export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Cookie',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'text/javascript',
    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Return JavaScript that can be injected into the page to force refresh
  const refreshScript = `
    (function() {
      const timestamp = new Date().getTime();
      
      // Clear all localStorage cache markers
      Object.keys(localStorage).forEach(key => {
        if (key.includes('react-query') || key.includes('tanstack')) {
          localStorage.removeItem(key);
        }
      });
      
      // Force React Query to invalidate
      if (window.queryClient) {
        window.queryClient.clear();
        window.queryClient.invalidateQueries();
        window.queryClient.removeQueries();
      }
      
      // Trigger window events that React Query listens for
      window.dispatchEvent(new Event('focus'));
      window.dispatchEvent(new Event('visibilitychange'));
      
      // Mark the cache as invalidated
      sessionStorage.setItem('cache-invalidated-' + timestamp, 'true');
      
      // Force page reload after 2 seconds if needed
      setTimeout(() => {
        if (!sessionStorage.getItem('data-refreshed-' + timestamp)) {
          console.log('🔄 FORCING PAGE RELOAD - CACHE INVALIDATION COMPLETE');
          window.location.reload();
        }
      }, 2000);
      
      console.log('🔧 INSTANT REFRESH TRIGGERED:', timestamp);
      
      return { success: true, timestamp };
    })();
  `;

  return {
    statusCode: 200,
    headers,
    body: refreshScript
  };
};