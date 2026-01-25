import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="relative flex place-items-center">
        <h1 className="text-6xl font-bold text-center">Test Page</h1>
      </div>
      
       <div className="mt-8">
            <p className="text-center">This is a rebuilt one-page test site.</p>
            <p className="text-center mt-4 text-sm text-gray-500">Image content has been preserved in src/images and public/.</p>
      </div>
    </main>
  );
}
