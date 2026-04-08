function Error({ error }){
    return (
        <div className="min-h-screen w-screen bg-white">
          <div className="border border-red-200 bg-red-50 text-red-700 p-4 rounded-xl">
            {error}
          </div>
      </div>
    )
}

export default Error;