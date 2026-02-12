import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-lg shadow-md border border-gray-200">
        
        {/* Large Error Code */}
        <h1 className="text-6xl font-bold text-red-500 mb-4 tracking-tighter">
          403
        </h1>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Access Restricted
        </h2>
        
        {/* Description */}
        <p className="text-gray-600 mb-8">
          You do not have the required permissions to view this page. 
          Please contact your administrator if you believe this is an error.
        </p>
        
        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link 
            href="/dashboard" 
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            Return to Dashboard
          </Link>
          
          <Link 
            href="/" 
            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition-colors"
          >
            Go to Home
          </Link>
        </div>

      </div>
    </div>
  );
}