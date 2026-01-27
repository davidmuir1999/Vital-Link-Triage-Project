import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex">
        <div className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-linear-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4">
          <p>Vital-Link Hospital System</p>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900">System Offline</h1>
        <p className="text-gray-600">Please authorize to access patient records.</p>
        
        <Link 
          href="/login" 
          className="mt-4 rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors"
        >
          Go to Staff Login
        </Link>
      </div>
    </main>
  );
}