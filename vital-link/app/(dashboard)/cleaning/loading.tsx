export default function CleaningLoading() {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div>
          <div className="h-9 w-64 bg-slate-200 rounded-md mb-2"></div>
          <div className="h-5 w-60 bg-slate-200 rounded-md mb-8"></div>
        </div>
  
        {[1, 2].map((wardIndex) => (
          <div 
            key={wardIndex} 
            className="border-t-4 border-t-slate-200 shadow-sm border border-slate-200 rounded-xl bg-white overflow-hidden"
          >
            <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-center">
              <div className="h-7 w-40 bg-slate-300 rounded-md"></div>
              <div className="h-6 w-24 bg-slate-200 rounded-md"></div>
            </div>
            
            <div className="p-6 pt-4 bg-slate-50/50 rounded-b-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((bedIndex) => (
                  <div
                    key={bedIndex}
                    className="flex justify-between items-center p-4 border border-slate-200 rounded-xl bg-white shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10.5 h-10.5 bg-slate-200 rounded-lg"></div>
                      <div className="h-6 w-16 bg-slate-200 rounded-md"></div>
                    </div>
                    
                    <div className="h-11 w-36 bg-slate-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }