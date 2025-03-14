addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  // Extract the target URL from the path (everything after the domain)
  const targetUrl = url.pathname.slice(1); // Remove the leading '/'
  
  // Validate the target URL
  let target;
  try {
    target = new URL(targetUrl);
    if (target.protocol !== 'http:' && target.protocol !== 'https:') {
      throw new Error('Invalid protocol');
    }
  } catch (error) {
    return new Response('Invalid target URL', { status: 400 });
  }

  // Handle OPTIONS requests for CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Forward the request to the target URL
  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });

    // Add CORS headers to the response
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  } catch (error) {
    return new Response('Error fetching target URL', { status: 500 });
  }
}
