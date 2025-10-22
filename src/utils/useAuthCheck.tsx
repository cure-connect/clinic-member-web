import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp?: number;
}

const isTokenExpiredClientSide = (token: string): boolean => {
  if (!token) return true;
  
  try {
    const decoded: DecodedToken = jwtDecode(token);
    
    if (typeof decoded.exp !== 'number') {
        console.error("Token decoded successfully but 'exp' property is missing or invalid.");
        return true; 
    }

    const currentTime = Date.now() / 1000;
    
    return decoded.exp < currentTime; 

  } catch (error) {
    console.error('Error decoding token or token is invalid:', error);
    return true;
  }
};

const useAuthCheck = () => {
  useEffect(() => {
    const token = localStorage.getItem('clinicToken');
    
    if (token && isTokenExpiredClientSide(token)) {
      console.error('Client-side check: Token is already expired or invalid. Forcing logout.');
      
      localStorage.removeItem('clinicToken');
      localStorage.removeItem('clinicUser');
    }
  }, []);
};

export default useAuthCheck;