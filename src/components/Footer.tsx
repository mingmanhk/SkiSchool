
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12 px-4">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg font-bold mb-4">Cascade Ski School</h3>
          <p className="text-gray-400">
            Experience the thrill of the slopes with our expert instructors.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/programs" className="text-gray-400 hover:text-white">
                Programs
              </Link>
            </li>
            <li>
              <Link href="/schedule" className="text-gray-400 hover:text-white">
                Schedule
              </Link>
            </li>
            <li>
              <Link href="/instructors" className="text-gray-400 hover:text-white">
                Instructors
              </Link>
            </li>
            <li>
              <Link href="/faq" className="text-gray-400 hover:text-white">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-gray-400 hover:text-white">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Contact Us</h3>
          <p className="text-gray-400">info@cascadeskischool.com</p>
          <p className="text-gray-400">123-456-7890</p>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white">
              {/* Add social media icons here */}
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} Cascade Ski School. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
