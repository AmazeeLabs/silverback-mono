import { TokenAuthClient } from '@amazeelabs/token-auth-middleware';
import styled from '@emotion/styled';
import type { Credentials } from 'decap-cms-lib-util';
import {
  AuthenticationPage,
  buttons,
  colors,
  colorsRaw,
  lengths,
  shadows,
  zIndex,
} from 'decap-cms-ui-default';
import React, { FormEvent, useEffect, useState } from 'react';

const LoginButton = styled.button`
  white-space: nowrap;
  ${buttons.button};
  ${shadows.dropDeep};
  ${buttons.default};
  ${buttons.gray};
`;

const AuthForm = styled.form`
  display: flex;
`;

const AuthInput = styled.input`
  background-color: ${colorsRaw.white};
  border-radius: ${lengths.borderRadius};
  font-size: 14px;
  padding: 10px;
  margin-right: 15px;
  width: 100%;
  position: relative;
  z-index: ${zIndex.zIndex1};

  &:focus {
    outline: none;
    box-shadow: inset 0 0 0 2px ${colors.active};
  }
`;

const ErrorMessage = styled.p`
  color: ${colors.errorText};
`;

const SuccessMessage = styled.p`
  color: ${colors.statusReadyText};
`;

type LoginState = 'idle' | 'progress' | 'sent' | 'validating';

type AuthComponentProps = {
  onLogin: (credentials: Credentials) => void;
  inProgress?: boolean;
  config: {
    logo_url: string;
    site_url: string;
    backend: {
      api_root: string;
    };
  };
  t: (key: string) => string;
};

export const AuthComponent = ({
  config,
  t,
  onLogin,
  inProgress,
}: AuthComponentProps) => {
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<LoginState>('validating');
  const [email, setEmail] = useState('');

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    const client = new TokenAuthClient(config.backend.api_root);
    setState('progress');
    const destination = new URL(window.location.href);
    try {
      await client.login(email, destination.toString());
      setState('sent');
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
        setState('idle');
      }
    }
  };

  // Check one time if the user already has a valid session and log in immediately.
  // Tracks attempts in a state to avoid infinite loops.
  const [authAttempted, setAuthAttempted] = useState(false);
  useEffect(() => {
    if (!authAttempted) {
      const client = new TokenAuthClient(config.backend.api_root);
      setAuthAttempted(true);
      client
        .status()
        .then(() => {
          // If the user has a valid session, log in immediately.
          onLogin({});
          return;
        })
        .catch(() => {
          // If the user does not have a valid session, do nothing.
          setState('idle');
        });
    }
  }, [onLogin, authAttempted, setAuthAttempted, config.backend.api_root]);

  return (
    <AuthenticationPage
      logoUrl={config.logo_url}
      siteUrl={config.site_url}
      renderPageContent={() => (
        <>
          {state === 'sent' ? (
            <SuccessMessage>
              An email has been sent to {email}. Please check your inbox and
              click the link to log in.
            </SuccessMessage>
          ) : (
            <>
              {error ? <ErrorMessage>{error}</ErrorMessage> : null}
              <AuthForm
                onSubmit={handleLogin}
                style={{
                  opacity: state === 'validating' ? 0 : 1,
                  transition: 'opacity 0.3s',
                }}
              >
                <AuthInput
                  type="text"
                  name="email"
                  placeholder="Email"
                  value={email}
                  disabled={inProgress || state !== 'idle'}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <LoginButton disabled={state !== 'idle'}>
                  {state !== 'idle' || inProgress
                    ? t('auth.loggingIn')
                    : t('auth.login')}
                </LoginButton>
              </AuthForm>
            </>
          )}
        </>
      )}
      t={t}
    />
  );
};
