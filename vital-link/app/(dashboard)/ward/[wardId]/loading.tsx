export default async function Loading() {

  return (
    <div className="space-y-6">
      {/* HEADER & BACK BUTTON */}
      <div className="flex items-center justify-between">
        <div>
        <div className="h-8 w-48 bg-gray-200 rounded-md"></div>
        <div className="h-8 w-48 bg-gray-200 rounded-md"></div>
        </div>
      </div>

      {/* BEDS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[1,2,3,4,5,6,7,8,9,10].map((i) => (
          <div
            key={i}
            className="h-20 bg-gray-100 rounded-xl border border-gray-200 animate-pulse"
          >
          </div>
        ))}
      </div>
    </div>
  );
}
