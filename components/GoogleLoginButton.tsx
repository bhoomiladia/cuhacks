"use client";

import { useGoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface GoogleLoginButtonProps {
  className?: string;
  children: React.ReactNode;
}

export default function GoogleLoginButton({ className, children }: GoogleLoginButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ accessToken: tokenResponse.access_token }),
        });

        const data = await res.json();

        if (res.ok) {
          if (!data.hasPassword) {
            router.push('/set-password');
          } else {
            router.push('/dashboard');
          }
        } else {
          console.error('Google Login Failed');
        }
      } catch (err) {
        console.error('Google Login Error', err);
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      console.error('Google Login Failed');
    },
  });

  return (
    <button 
      type="button"
      onClick={() => login()} 
      className={className}
      disabled={isLoading}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
}
