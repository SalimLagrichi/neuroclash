import { ClerkProvider } from '@clerk/nextjs';
import type { AppProps } from 'next/app';
import '../app/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  console.log("Rendering _app with ClerkProvider only");
  return (
    <ClerkProvider>
      <Component {...pageProps} />
    </ClerkProvider>
  );
} 