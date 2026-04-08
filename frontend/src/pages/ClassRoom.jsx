import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactPlayer from "react-player";
import { getCourseById } from "../api/mock";

export default function ClassRoom() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([
    { id: 1, author: "GV", text: "Chào cả lớp 👋" },
  ]);
  const [input, setInput] = useState("");

  useEffect(() => {
    getCourseById(id).then((c) => {
      setCourse(c);
      setLoading(false);
    });
  }, [id]);

  const sendMsg = () => {
    if (!input.trim()) return;
    setMessages((m) => [...m, { id: Date.now(), author: "Bạn", text: input }]);
    setInput("");
  };

  if (loading) return <p className="p-6">Đang mở lớp...</p>;
  if (!course) return <p className="p-6">Không thấy lớp.</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
      <div className="lg:col-span-2 space-y-3">
        <h2 className="text-xl font-semibold">{course.title}</h2>
        <div className="aspect-video bg-black/80 rounded overflow-hidden">
          <ReactPlayer
            url={course.videoUrl}
            width="100%"
            height="100%"
            controls
          />
        </div>

        <div className="p-4 border rounded">
          <h3 className="font-semibold mb-2">Tài liệu</h3>
          <ul className="list-disc pl-5">
            {course.resources.map((r, i) => (
              <li key={i}><a href={r.url}>{r.name}</a></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border rounded flex flex-col">
        <div className="p-3 border-b font-semibold">Chat lớp</div>
        <div className="flex-1 p-3 space-y-2 overflow-auto">
          {messages.map((m) => (
            <div key={m.id}>
              <span className="font-medium">{m.author}: </span>
              <span>{m.text}</span>
            </div>
          ))}
        </div>
        <div className="p-3 border-t flex gap-2">
          <input
            className="flex-1 border rounded px-3 py-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập tin nhắn…"
          />
          <button onClick={sendMsg} className="bg-blue-600 text-white px-3 rounded">
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
