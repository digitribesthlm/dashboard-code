import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

// Get JWT_SECRET from environment variable
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('WARNING: JWT_SECRET is not defined in environment variables!');
}

export async function verifyAuth(request) {
  try {
    // Get the auth token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token');
    
    if (!token) {
      return { 
        authenticated: false, 
        message: 'Not authenticated'
      };
    }
    
    try {
      // Verify and decode the token with the secure secret
      const user = verify(
        token.value, 
        JWT_SECRET || 'fallback-secret-key-for-development-only'
      );
      
      return { 
        authenticated: true, 
        user
      };
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return { 
        authenticated: false, 
        message: 'Invalid token'
      };
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return { 
      authenticated: false, 
      message: 'Internal server error'
    };
  }
} 