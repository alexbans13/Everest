import { Redirect } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
  useEffect(() => {
    console.log('[APP] App starting, redirecting to splash screen');
  }, []);

  // Redirect to splash screen first
  return <Redirect href="/splash" />;
}

