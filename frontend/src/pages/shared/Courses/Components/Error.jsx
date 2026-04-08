const Error = (error) => {error && (
        <div className="w-screen px-6 lg:px-12 mt-6">
            <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 p-4">
            {error}
            </div>
        </div>
    )}

export default Error;