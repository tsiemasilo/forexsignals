import { neon } from '@neondatabase/serverless';

// Test login function for production debugging
export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Test Login</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
              .form { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
              input, button { display: block; width: 100%; padding: 10px; margin: 10px 0; }
              button { background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer; }
              .result { margin: 20px 0; padding: 15px; border-radius: 4px; }
              .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
              .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
            </style>
          </head>
          <body>
            <h1>Production Login Test</h1>
            <div class="form">
              <h3>Quick Login</h3>
              <input type="email" id="email" placeholder="Enter email" value="almeerahlosper@gmail.com">
              <button onclick="testLogin()">Login</button>
            </div>
            <div id="result"></div>
            <script>
              async function testLogin() {
                const email = document.getElementById('email').value;
                const result = document.getElementById('result');
                
                try {
                  const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ email })
                  });
                  
                  const data = await response.json();
                  
                  if (response.ok) {
                    result.innerHTML = \`
                      <div class="success">
                        <h4>Login Successful!</h4>
                        <p>User: \${data.user.firstName} \${data.user.lastName}</p>
                        <p>Email: \${data.user.email}</p>
                        <p>Admin: \${data.user.isAdmin ? 'Yes' : 'No'}</p>
                        <p>Session ID: \${data.sessionId}</p>
                        <button onclick="testAuth()">Test Authentication</button>
                        <button onclick="location.href='\${data.redirectUrl || '/dashboard'}'">Go to Dashboard</button>
                      </div>
                    \`;
                  } else {
                    result.innerHTML = \`
                      <div class="error">
                        <h4>Login Failed</h4>
                        <p>\${data.message || 'Unknown error'}</p>
                      </div>
                    \`;
                  }
                } catch (error) {
                  result.innerHTML = \`
                    <div class="error">
                      <h4>Network Error</h4>
                      <p>\${error.message}</p>
                    </div>
                  \`;
                }
              }
              
              async function testAuth() {
                const result = document.getElementById('result');
                try {
                  const response = await fetch('/api/auth', {
                    credentials: 'include'
                  });
                  const data = await response.json();
                  
                  result.innerHTML += \`
                    <div class="\${response.ok ? 'success' : 'error'}">
                      <h4>Auth Test: \${response.ok ? 'Success' : 'Failed'}</h4>
                      <pre>\${JSON.stringify(data, null, 2)}</pre>
                    </div>
                  \`;
                } catch (error) {
                  result.innerHTML += \`
                    <div class="error">
                      <h4>Auth Test Error</h4>
                      <p>\${error.message}</p>
                    </div>
                  \`;
                }
              }
            </script>
          </body>
        </html>
      `
    };
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ message: 'Method not allowed' })
  };
}