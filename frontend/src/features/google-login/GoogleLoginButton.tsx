import { useState } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';

export function GoogleLoginButton() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setError('Google did not return a credential');
      return;
    }
    try {
      await login(response.credential);
      navigate('/garage');
    } catch {
      setError('Login failed — please try again');
    }
  };

  return (
    <div>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => setError('Google login failed')}
        theme="filled_black"
        shape="pill"
      />
      {error && (
        <p style={{ color: 'var(--action-danger)', marginTop: 12, fontSize: 13 }}>{error}</p>
      )}
    </div>
  );
}
