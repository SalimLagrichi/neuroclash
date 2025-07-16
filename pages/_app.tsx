import type { AppProps } from 'next/app';
import '../app/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  console.log("Rendering _app with only Component");
  return <Component {...pageProps} />;
} 