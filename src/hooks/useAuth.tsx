import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { USERS, AUTH_KEYS } from '../pages/login/auth';

export const useAuth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    setAuthError(null);

    return new Promise((resolve) => {
      setTimeout(() => {
        setLoading(false);
        
        const admin = USERS.ADMIN;
        const coord = USERS.COORD;

        if (email === admin.email && pass === admin.password) {
          localStorage.setItem(AUTH_KEYS.TOKEN, admin.token);
          localStorage.setItem(AUTH_KEYS.USER, JSON.stringify({ email, role: admin.role }));
          navigate('/admin/dashboard');
        } 
        else if (email === coord.email && pass === coord.password) {
          localStorage.setItem(AUTH_KEYS.TOKEN, coord.token);
          localStorage.setItem(AUTH_KEYS.USER, JSON.stringify({ email, role: coord.role }));
          navigate('/coord/dashboard');
        } 
        else {
          setAuthError("E-mail ou senha incorretos.");
        }
        resolve(true);
      }, 1500);
    });
  };

  return { login, loading, authError };
};