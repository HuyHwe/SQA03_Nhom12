import { useState } from "react";
import DataTable from "../components/ui/DataTable";
import FileUpload from "../components/ui/FileUpload";
import DatePicker from "../components/ui/DatePicker";
import MultiSelect from "../components/ui/MultiSelect";
import RichTextEditor from "../components/ui/RichTextEditor";
import EmptyState, { EmptyStateCard } from "../components/ui/EmptyState";
import { ButtonLoading } from "../components/ui/LoadingSpinner";
import { CardSkeleton, TextSkeleton } from "../components/ui/Skeleton";
import Modal, { ConfirmModal } from "../components/ui/Modal";
import { useToast } from "../components/ui/Toast";

/**
 * TestComponents - Demo page for all UI components
 */
export default function TestComponents() {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTags, setSelectedTags] = useState([]);
    const [richText, setRichText] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { showToast } = useToast();

    // Sample data for DataTable
    const sampleData = [
        { id: 1, name: "Nguyễn Văn A", email: "a@test.com", age: 25, role: "Student", status: "Active" },
        { id: 2, name: "Trần Thị B", email: "b@test.com", age: 30, role: "Teacher", status: "Active" },
        { id: 3, name: "Lê Văn C", email: "c@test.com", age: 22, role: "Student", status: "Inactive" },
        { id: 4, name: "Phạm Thị D", email: "d@test.com", age: 28, role: "Admin", status: "Active" },
        { id: 5, name: "Hoàng Văn E", email: "e@test.com", age: 24, role: "Student", status: "Active" },
        { id: 6, name: "Đỗ Thị F", email: "f@test.com", age: 35, role: "Teacher", status: "Active" },
        { id: 7, name: "Vũ Văn G", email: "g@test.com", age: 27, role: "Student", status: "Inactive" },
        { id: 8, name: "Bùi Thị H", email: "h@test.com", age: 29, role: "Student", status: "Active" },
        { id: 9, name: "Đặng Văn I", email: "i@test.com", age: 31, role: "Teacher", status: "Active" },
        { id: 10, name: "Lý Thị K", email: "k@test.com", age: 26, role: "Student", status: "Active" },
        { id: 11, name: "Cao Văn L", email: "l@test.com", age: 23, role: "Student", status: "Inactive" },
        { id: 12, name: "Mai Thị M", email: "m@test.com", age: 32, role: "Admin", status: "Active" },
    ];

    const columns = [
        { key: "id", label: "ID" },
        { key: "name", label: "Họ tên" },
        { key: "email", label: "Email" },
        { key: "age", label: "Tuổi" },
        {
            key: "role",
            label: "Vai trò",
            render: (value) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${value === "Admin" ? "bg-purple-100 text-purple-700" :
                        value === "Teacher" ? "bg-blue-100 text-blue-700" :
                            "bg-gray-100 text-gray-700"
                    }`}>
                    {value}
                </span>
            )
        },
        {
            key: "status",
            label: "Trạng thái",
            render: (value) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${value === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                    {value === "Active" ? "Hoạt động" : "Không hoạt động"}
                </span>
            )
        },
    ];

    // Options for MultiSelect
    const techOptions = [
        { value: "react", label: "React" },
        { value: "vue", label: "Vue.js" },
        { value: "angular", label: "Angular" },
        { value: "svelte", label: "Svelte" },
        { value: "nextjs", label: "Next.js" },
        { value: "nuxt", label: "Nuxt.js" },
        { value: "remix", label: "Remix" },
        { value: "astro", label: "Astro" },
    ];

    const handleFileUpload = async (files) => {
        console.log("Uploading files:", files);
        // Simulate upload
        await new Promise((resolve) => setTimeout(resolve, 2000));
        showToast("Upload thành công!", "success");
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">UI Components Demo</h1>
                    <p className="text-gray-600 mt-2">Test tất cả UI components đã implement</p>
                </div>

                <div className="space-y-8">
                    {/* DataTable */}
                    <section className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">📊 DataTable</h2>
                        <p className="text-gray-600 mb-4">Table với sorting, filtering, và pagination</p>
                        <DataTable
                            data={sampleData}
                            columns={columns}
                            pageSize={5}
                            searchPlaceholder="Tìm kiếm theo tên, email..."
                        />
                    </section>

                    {/* Form Components */}
                    <section className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-800">📝 Form Components</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* DatePicker */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    📅 DatePicker
                                </label>
                                <DatePicker
                                    value={selectedDate}
                                    onChange={setSelectedDate}
                                    placeholder="Chọn ngày sinh"
                                />
                                {selectedDate && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        Đã chọn: {selectedDate.toLocaleDateString("vi-VN")}
                                    </p>
                                )}
                            </div>

                            {/* MultiSelect */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    🏷️ MultiSelect
                                </label>
                                <MultiSelect
                                    options={techOptions}
                                    value={selectedTags}
                                    onChange={setSelectedTags}
                                    placeholder="Chọn công nghệ..."
                                    maxSelected={4}
                                />
                                {selectedTags.length > 0 && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        Đã chọn: {selectedTags.length} mục
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* FileUpload */}
                    <section className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">📤 FileUpload</h2>
                        <p className="text-gray-600 mb-4">Drag-drop file upload với progress tracking</p>
                        <FileUpload
                            accept={["image/*", ".pdf", ".doc", ".docx"]}
                            multiple={true}
                            maxSize={10 * 1024 * 1024}
                            onUpload={handleFileUpload}
                        />
                    </section>

                    {/* RichTextEditor */}
                    <section className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">✏️ Rich Text Editor</h2>
                        <p className="text-gray-600 mb-4">Editor với formatting toolbar</p>
                        <RichTextEditor
                            value={richText}
                            onChange={setRichText}
                            placeholder="Nhập nội dung bài viết..."
                            minHeight={300}
                        />
                    </section>

                    {/* Buttons & Actions */}
                    <section className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">🔘 Buttons & Modals</h2>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => showToast("Success message!", "success")}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Success Toast
                            </button>
                            <button
                                onClick={() => showToast("Error occurred!", "error")}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Error Toast
                            </button>
                            <button
                                onClick={() => showToast("Warning message", "warning")}
                                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                            >
                                Warning Toast
                            </button>
                            <button
                                onClick={() => showToast("Info message", "info")}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Info Toast
                            </button>
                            <button
                                onClick={() => setShowModal(true)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                Open Modal
                            </button>
                            <button
                                onClick={() => setShowConfirm(true)}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                                Confirm Dialog
                            </button>
                            <ButtonLoading loading={false}>
                                Button Normal
                            </ButtonLoading>
                            <ButtonLoading loading={true}>
                                Button Loading
                            </ButtonLoading>
                        </div>
                    </section>

                    {/* Loading States */}
                    <section className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">⏳ Loading States</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium mb-2">Card Skeleton</h3>
                                <CardSkeleton />
                            </div>
                            <div>
                                <h3 className="font-medium mb-2">Text Skeleton</h3>
                                <TextSkeleton lines={3} />
                            </div>
                        </div>
                    </section>

                    {/* Empty States */}
                    <section className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">📭 Empty States</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <EmptyStateCard
                                icon="search"
                                title="Không tìm thấy kết quả"
                                description="Thử tìm kiếm với từ khóa khác"
                                action={
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                        Xóa bộ lọc
                                    </button>
                                }
                            />
                            <EmptyStateCard
                                icon="file"
                                title="Chưa có dữ liệu"
                                description="Bắt đầu bằng cách thêm mục đầu tiên"
                                action={
                                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                        Thêm mới
                                    </button>
                                }
                            />
                        </div>
                    </section>
                </div>
            </div>

            {/* Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Modal Example"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Đây là modal demo. Bạn có thể đặt bất kỳ nội dung nào vào đây.
                    </p>
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Đóng
                        </button>
                        <button
                            onClick={() => {
                                showToast("Action completed!", "success");
                                setShowModal(false);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Xác nhận
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={() => {
                    showToast("Confirmed!", "success");
                    setShowConfirm(false);
                }}
                title="Xác nhận hành động"
                confirmText="Đồng ý"
                cancelText="Hủy"
            >
                <p className="text-gray-600">
                    Bạn có chắc chắn muốn thực hiện hành động này không?
                </p>
            </ConfirmModal>
        </div>
    );
}
