/* eslint-disable react-refresh/only-export-components */
function SectionHeader({ title, icon }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
  );
}

function ResourceItem({ name, href }) {
  return (
    <a
      href={href}
      className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border hover:bg-gray-50"
      download
    >
      <span className="text-sm text-gray-800">{name}</span>
      <Download className="w-4 h-4 text-gray-500" />
    </a>
  );
}

{/* Tài nguyên */}
{/* <div className="bg-white border rounded-2xl p-6">
    <SectionHeader title="Tài nguyên đính kèm" icon={<Download className="w-5 h-5 text-gray-700" />} />
    {lesson.resources?.length ? (
    <div className="grid sm:grid-cols-2 gap-3">
        {lesson.resources.map((r, i) => (
        <ResourceItem key={i} {...r} />
        ))}
    </div>
    ) : (
    <div className="text-sm text-gray-600">Chưa có tài nguyên đính kèm.</div>
    )}
</div> */}

{/* Ghi chú cá nhân */}
{/* <div className="bg-white border rounded-2xl p-6">
    <SectionHeader title="Ghi chú của tôi" icon={<FileText className="w-5 h-5 text-gray-700" />} />
    <textarea
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
    rows={5}
    placeholder="Ghi lại ý chính, câu hỏi..."
    className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
    />
    <p className="mt-2 text-xs text-gray-500">Tự động lưu vào trình duyệt (local).</p>
</div> */}

{/* Bình luận */}
{/* <div className="bg-white border rounded-2xl p-6">
    <SectionHeader title="Bình luận" icon={<MessageSquare className="w-5 h-5 text-gray-700" />} />
    <form onSubmit={addComment} className="grid gap-3">
    <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Chia sẻ câu hỏi hoặc thảo luận của bạn…"
        className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
    />
    <div className="flex justify-between text-sm">
        <span className="text-gray-500">Ctrl + Enter để đăng</span>
        <button
        type="submit"
        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-medium"
        >
        Đăng bình luận
        </button>
    </div>
    </form>
    <div className="mt-4 grid gap-3">
    {comments.length === 0 && <p className="text-sm text-gray-500">Chưa có bình luận nào.</p>}
    {comments.map((c) => (
        <div key={c.id} className="border rounded-xl p-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Khách</span>
            <span>{new Date(c.at).toLocaleString("vi-VN", { hour12: false })}</span>
        </div>
        <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{c.text}</p>
        <div className="mt-2 text-right">
            <button
            onClick={() => removeComment(c.id)}
            className="text-xs text-gray-500 border px-2 py-1 rounded-full hover:bg-gray-50"
            >
            Xóa
            </button>
        </div>
        </div>
    ))}
    </div>
</div> */}