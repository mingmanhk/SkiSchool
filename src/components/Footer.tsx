
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Ski School OS</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              The complete management platform for ski schools, clubs, and race programs.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Product</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#features" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition">Features</Link></li>
              <li><Link href="#pricing" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition">Pricing</Link></li>
              <li><Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition">Request Demo</Link></li>
              <li><Link href="/docs" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition">Documentation</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition">Contact</Link></li>
              <li><Link href="/login" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition">Tenant Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-500 text-center md:text-left">
            &copy; {new Date().getFullYear()} Ski School OS. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
             {/* Social placeholders */}
             <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"><span className="sr-only">Twitter</span>🐦</a>
             <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"><span className="sr-only">LinkedIn</span>💼</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
