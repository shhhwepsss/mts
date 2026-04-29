import { useState } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/auth';
import { useI18n } from '@/shared/i18n';

export function GoogleLoginButton() {
  const { login } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setError(t('login.googleNoCredential'));
      return;
    }
    try {
      await login(response.credential);
      navigate('/garage');
    } catch {
      setError(t('login.loginFailed'));
    }
  };

  return (
    <div>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => setError(t('login.googleFailed'))}
        theme="filled_black"
        shape="pill"
      />
      {error && (
        <p style={{ color: 'var(--action-danger)', marginTop: 12, fontSize: 13 }}>{error}</p>
      )}
    </div>
  );
}
