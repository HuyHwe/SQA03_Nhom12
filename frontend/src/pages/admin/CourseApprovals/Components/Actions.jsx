function Actions({ statusFilter, setStatusFilter, onStatusChange }) {
    const handleChangeStatus = (status) => {
        setStatusFilter(status);
        onStatusChange?.(status);
    };
    return (
        <div className="bg-white rounded-lg shadow-sm border mb-6">
            <div className="flex border-b p-2 gap-4">
                {["pending", "published", "rejected"].map((status) => (
                    <button
                        key={status}
                        onClick={() => handleChangeStatus(status)}
                        className={`px-6 py-4 font-medium bg-transparent transition-colors ${statusFilter === status
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-600 hover:text-gray-900"
                            }`}
                    >
                        {status === "pending" && "Chờ duyệt"}
                        {status === "published" && "Đã duyệt"}
                        {status === "rejected" && "Đã từ chối"}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default Actions;