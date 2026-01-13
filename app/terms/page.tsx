
export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12 px-4 text-gray-800 dark:text-gray-200">
      <h1 className="mb-6 text-3xl font-bold">Terms and Conditions</h1>
      <p className="mb-4 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
      
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">1. Introduction</h2>
        <p>Welcome to Ski School OS. By accessing our website and using our services, you agree to be bound by these Terms and Conditions.</p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">2. Use of Platform</h2>
        <p>You agree to use the platform only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the platform.</p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">3. User Accounts</h2>
        <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">4. Liability</h2>
        <p>Ski School OS is provided "as is". We are not liable for any damages arising from the use of this platform, including but not limited to direct, indirect, incidental, punitive, and consequential damages.</p>
      </section>
      
      <section>
        <h2 className="mb-2 text-xl font-semibold">5. Contact</h2>
        <p>For any questions regarding these terms, please contact support@skischoolos.com.</p>
      </section>
    </div>
  )
}
