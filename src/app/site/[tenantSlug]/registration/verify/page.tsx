export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ email: string }> }) {
  const { email } = await searchParams;
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md text-center">
      <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
      <p className="mb-4 text-gray-600">
        We found existing records for <strong>{email}</strong>.
      </p>
      <p className="text-gray-600">
        Please check your email for a verification link to claim your account.
      </p>
      <div className="mt-6">
        <button disabled className="bg-gray-300 text-white py-2 px-4 rounded cursor-not-allowed">
            Resend Email
        </button>
      </div>
    </div>
  );
}
