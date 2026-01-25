
import { redirect } from 'next/navigation';

// Root page component for handling redirection
export default function RootPage() {
  // Use server-side redirect to the default locale
  redirect('/en');
}
