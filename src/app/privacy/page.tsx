
export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12 px-4 text-gray-800 dark:text-gray-200">
      <h1 className="mb-6 text-3xl font-bold">Privacy Policy</h1>
      <p className="mb-4 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">1. Data Collection</h2>
        <p>We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us. This may include your name, email address, phone number, and payment information.</p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">2. Use of Data</h2>
        <p>We use your data to provide, maintain, and improve our services, including processing transactions, sending notifications (like class status updates), and providing customer support.</p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">3. Data Sharing</h2>
        <p>We do not sell your personal data. We may share data with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf (e.g., payment processors).</p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">4. Data Security</h2>
        <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access.</p>
      </section>
    </div>
  )
}
