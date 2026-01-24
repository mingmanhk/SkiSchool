import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center px-6">
      <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404 - Page Not Found</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        Oops! The page you are looking for does not exist. It might have been moved or deleted.
      </p>
      <Link href="/">
        <Button size="lg" className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-3 rounded-full">
          Return Home
        </Button>
      </Link>
    </div>
  )
}
