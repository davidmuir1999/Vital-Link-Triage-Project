export default function Loading() {
    return (
      <div className="p-6 space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-2 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded-md"></div>
          <div className="h-4 w-96 bg-gray-200 rounded-md"></div>
        </div>
  
        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-xl border border-gray-200 animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }