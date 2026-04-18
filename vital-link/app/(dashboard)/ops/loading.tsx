export default function BedBureauLoading() {
    return (
      <div className="p-8 h-screen flex flex-col animate-pulse">
        <div className="h-9 w-72 bg-slate-200 rounded-md mb-6"></div>
  
        <div className="flex h-full gap-6">
          <div className="w-1/3 bg-gray-50 border rounded-lg p-4 flex flex-col">
            <div className="h-7 w-48 bg-slate-200 rounded-md mb-4 border-b pb-2"></div>
  
            <div className="flex-1 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white border p-3 rounded-lg shadow-sm">
                  <div className="flex flex-col gap-2">
                    <div className="h-5 w-3/4 bg-slate-200 rounded"></div>
                    <div className="h-3 w-1/2 bg-slate-100 rounded mt-0.5"></div>
                    <div className="flex justify-between items-center pt-2 mt-1 border-t border-gray-100">
                      <div className="h-5 w-16 bg-slate-200 rounded"></div>
                      <div className="h-5 w-24 bg-slate-100 rounded border"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
  
          <div className="w-2/3 bg-white border rounded-lg p-4">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <div className="h-7 w-40 bg-slate-200 rounded-md"></div>
              <div className="h-8 w-28 bg-slate-100 rounded-md border border-slate-200"></div>
            </div>
  
            <div className="space-y-6">
              {[1, 2].map((wardIndex) => (
                <div key={wardIndex} className="border rounded bg-gray-50 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="h-6 w-32 bg-slate-300 rounded"></div>
                    <div className="h-6 w-24 bg-slate-200 rounded"></div>
                  </div>
  
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((bedIndex) => (
                      <div
                        key={bedIndex}
                        className="border-2 border-dashed border-slate-200 rounded p-3 h-24 flex flex-col justify-center items-center bg-white opacity-60"
                      >
                        <div className="h-3 w-8 bg-slate-200 rounded mb-2"></div>
                        <div className="h-4 w-16 bg-slate-100 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }