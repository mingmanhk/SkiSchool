import Navbar from '@/components/Navbar';
import Hero from '@/components/landing/Hero';
import Footer from '@/components/Footer';
import { createClient } from '@/utils/supabase/server';

export default async function Home() {
  const supabase = createClient();
  // We don't necessarily need to await anything here for the public landing page
  // But initializing the client ensures the server utils are working.
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <Hero />
      </main>

      <Footer />
    </div>
  );
}
