// src/pages/student/Profile.jsx
"use client";

import { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  User, Mail, Lock, Bell, Globe, Edit3, Save,
  BookOpen, Trophy, History, Camera
} from "lucide-react";

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: "Nguyễn Thành Luân",
    email: "student@example.com",
    role: "Học sinh",
    language: "vi",
    notifications: true,
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [avatar, setAvatar] = useState("/avatar-default.png");

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setEditing(false);
    alert("✅ Lưu thay đổi thành công!");
  };

  const handlePasswordChange = (field, value) => {
    setPasswords((p) => ({ ...p, [field]: value }));
  };

  const handleChangeAvatar = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
    }
  };

  return (
    <div className="min-h-screen w-screen max-w-none bg-gray-50 text-gray-900">
      <Header />

      {/* HERO */}
      <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="w-full px-6 lg:px-12 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">👤 Hồ sơ & Cài đặt</h1>
            <p className="text-gray-600 text-sm">Quản lý thông tin tài khoản, mật khẩu và tùy chỉnh hiển thị</p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center gap-2"
              >
                <Edit3 size={16} /> Chỉnh sửa
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm flex items-center gap-2"
              >
                <Save size={16} /> Lưu thay đổi
              </button>
            )}
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="w-full px-6 lg:px-12 py-8 space-y-8">
        {/* PERSONAL INFO */}
        <section className="bg-white border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <User size={18} /> Thông tin cá nhân
          </h2>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100 shadow">
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                {editing && (
                  <>
                    <label
                      htmlFor="avatar"
                      className="absolute inset-0 bg-black/40 flex items-center justify-center text-white cursor-pointer"
                    >
                      <Camera className="w-6 h-6" />
                    </label>
                    <input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleChangeAvatar}
                    />
                  </>
                )}
              </div>
              <p className="mt-3 font-medium text-gray-900">{profile.fullName}</p>
              <p className="text-sm text-gray-600">{profile.role}</p>
            </div>

            {/* Info form */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  disabled={!editing}
                  className={`w-full border rounded-lg px-4 py-2 ${
                    editing ? "border-blue-400" : "border-gray-200 bg-gray-50"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full border rounded-lg px-4 py-2 border-gray-200 bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Vai trò</label>
                <input
                  type="text"
                  value={profile.role}
                  disabled
                  className="w-full border rounded-lg px-4 py-2 border-gray-200 bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Ngôn ngữ hiển thị</label>
                <select
                  value={profile.language}
                  onChange={(e) => handleChange("language", e.target.value)}
                  disabled={!editing}
                  className={`w-full border rounded-lg px-4 py-2 ${
                    editing ? "border-blue-400" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <option value="vi">🇻🇳 Tiếng Việt</option>
                  <option value="en">🇺🇸 English</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* ACCOUNT SETTINGS */}
        <section className="bg-white border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Lock size={18} /> Cài đặt tài khoản
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Mật khẩu hiện tại</label>
              <input
                type="password"
                value={passwords.current}
                onChange={(e) => handlePasswordChange("current", e.target.value)}
                placeholder="••••••••"
                className="w-full border rounded-lg px-4 py-2 border-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Mật khẩu mới</label>
              <input
                type="password"
                value={passwords.new}
                onChange={(e) => handlePasswordChange("new", e.target.value)}
                placeholder="••••••••"
                className="w-full border rounded-lg px-4 py-2 border-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Xác nhận mật khẩu</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => handlePasswordChange("confirm", e.target.value)}
                placeholder="••••••••"
                className="w-full border rounded-lg px-4 py-2 border-gray-200"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 border-t pt-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={profile.notifications}
                onChange={(e) => handleChange("notifications", e.target.checked)}
                disabled={!editing}
              />
              <Bell size={16} /> Nhận thông báo email
            </label>

            <button
              onClick={() => alert("✅ Đổi mật khẩu thành công!")}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm"
            >
              Cập nhật mật khẩu
            </button>
          </div>
        </section>

        {/* RECENT ACTIVITY */}
        <section className="bg-white border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <History size={18} /> Hoạt động gần đây
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-xl p-4 flex items-start gap-3 hover:bg-gray-50 transition">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Đang học: “Khóa học ReactJS cơ bản”</p>
                <p className="text-sm text-gray-500">Tiến độ: 60%</p>
              </div>
            </div>

            <div className="border rounded-xl p-4 flex items-start gap-3 hover:bg-gray-50 transition">
              <Trophy className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Hoàn thành bài thi: “JS Cơ bản”</p>
                <p className="text-sm text-gray-500">Điểm: 9/10 (90%)</p>
              </div>
            </div>

            <div className="border rounded-xl p-4 flex items-start gap-3 hover:bg-gray-50 transition">
              <Globe className="w-6 h-6 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Ngôn ngữ hiển thị: {profile.language === "vi" ? "Tiếng Việt" : "English"}</p>
                <p className="text-sm text-gray-500">Thay đổi gần nhất: hôm qua</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
