import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authEndpoints } from '@/api/authApi';
import { useAuthStore }  from '@/store/authStore';
import { useUIStore }    from '@/store/uiStore';

export function useLogin() {
  const { login }      = useAuthStore();
  const { showToast }  = useUIStore();
  const navigate       = useNavigate();

  return useMutation({
    mutationFn: authEndpoints.login,
    onSuccess: (data) => {
      login({ token: data.token, user: data.user });
      showToast({ type: 'success', title: 'Welcome back!', message: `Logged in as ${data.user.name}` });
      navigate('/dashboard');
    },
    onError: (err) => {
      showToast({ type: 'error', title: 'Login failed', message: err.message });
    },
  });
}

export function useLogout() {
  const { logout }    = useAuthStore();
  const { showToast } = useUIStore();
  const navigate      = useNavigate();

  return () => {
    logout();
    showToast({ type: 'info', title: 'Signed out', message: 'See you next time!' });
    navigate('/login');
  };
}
