import { NextApiRequest, NextApiResponse } from 'next';

// API proxy to avoid CORS issues
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  
  if (!path || !Array.isArray(path)) {
    return res.status(400).json({ error: 'Invalid path' });
  }
  
  const apiPath = path.join('/');
  const apiUrl = `http://localhost:8000/messages/${apiPath}`;
  
  try {
    // Forward the request to the backend API
    const response = await fetch(apiUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        // Forward auth header if present
        ...(req.headers.authorization ? { 'Authorization': req.headers.authorization as string } : {})
      },
      // Forward the request body for POST, PUT, PATCH
      ...(req.method !== 'GET' && req.method !== 'HEAD' && req.body 
        ? { body: JSON.stringify(req.body) } 
        : {}
      )
    });
    
    // Get the response data
    const data = await response.json().catch(() => ({}));
    
    // Return the response with the same status code
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    return res.status(500).json({ error: 'Failed to communicate with API server' });
  }
}