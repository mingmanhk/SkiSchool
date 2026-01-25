import Navbar from '@/components/Navbar';
import Hero from '@/components/landing/Hero';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
      <Navbar />
      
      <main className="overflow-hidden">
        <Hero />
      </main>

      <Footer />
    </div>
  );
}
