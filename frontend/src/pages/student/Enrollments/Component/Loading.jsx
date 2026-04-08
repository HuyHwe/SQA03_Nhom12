function Loading(){
    return (
        <div className="w-full px-6 lg:px-12 py-10">
            {Array.from({ length: 5 }).map((_, i) => (
                <article key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4 animate-pulse">
                        
                        <div className="w-32 h-20 bg-gray-200 rounded-md"></div>

                        <div className="flex-1 min-w-0 space-y-2">

                        <div className="w-24 h-3 bg-gray-200 rounded"></div>

                        <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                        <div className="w-2/3 h-4 bg-gray-200 rounded"></div>

                        <div className="w-32 h-3 bg-gray-200 rounded mt-2"></div>

                        <div className="space-y-2 mt-3">
                            <div className="flex items-center justify-between">
                            <div className="w-12 h-3 bg-gray-200 rounded"></div>
                            <div className="w-6 h-3 bg-gray-200 rounded"></div>
                            </div>
                            
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-2 bg-gray-300 rounded-full w-1/3"></div>
                            </div>
                        </div>

                        </div>
                    </div>
                </article>
            ))}
        </div>
    )
}

export default Loading;