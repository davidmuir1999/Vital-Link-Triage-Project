export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="h-8 w-48 sm:w-64 bg-slate-200 rounded-md"></div>
          <div className="h-4 w-32 sm:w-48 bg-slate-100 rounded-md"></div>
        </div>
        
        <div className="h-10 w-24 bg-slate-200 rounded-md hidden sm:block"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[1,2,3,4,5,6,7,8,9,10].map((i) => (
          <div
            key={i}
            className="h-24 bg-white rounded-xl border border-slate-200 p-3 sm:p-4 flex flex-col justify-center items-center shadow-sm"
          >
            <div className="h-4 w-12 bg-slate-200 rounded mb-3"></div>
            <div className="h-3 w-20 bg-slate-100 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}