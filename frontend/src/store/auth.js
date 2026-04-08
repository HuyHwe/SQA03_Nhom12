import { create } from "zustand";
import { api } from "../lib/api";

export const useAuth = create((set, get) => ({
  user: null,
  isHydrated: false,

  hydrate: () => {
    try {
      const raw = localStorage.getItem("auth_state");
      if (raw) {
        const state = JSON.parse(raw);
        if (state?.user) set({ user: state.user });
        if (state?.token) localStorage.setItem("access_token", state.token);
        if (state?.refreshToken)
          localStorage.setItem("refresh_token", state.refreshToken);
      }
    } catch {}
    set({ isHydrated: true });
  },

  login: async ({ email, password, remember = false }) => {
    try {
      const res = await api.post("/api/Auth/login", { email, password });
      const {
        token,
        refreshToken,
        userId,
        fullName,
        studentId = null,
        teacherId = null,
      } = res.data || {};

      if (!token || !userId) {
        const e = new Error("Đăng nhập thất bại: thiếu token hoặc userId");
        e.code = "MALFORMED_RESPONSE";
        throw e;
      }

      const user = { id: userId, fullName, studentId, teacherId };

      localStorage.setItem("access_token", token);
      localStorage.setItem("refresh_token", refreshToken || "");
      if (remember) {
        localStorage.setItem(
          "auth_state",
          JSON.stringify({ user, token, refreshToken })
        );
      } else {
        localStorage.removeItem("auth_state");
      }

      set({ user });
      return user;
    } catch (err) {
      const status = err?.response?.status;
      const serverMsg =
        err?.response?.data?.message || err?.data?.message || err?.message;

      let friendly = "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.";
      if (status === 401) {
        friendly =
          serverMsg || "Tài khoản hoặc mật khẩu không đúng. Vui lòng thử lại.";
      } else if (serverMsg?.toLowerCase?.().includes("network")) {
        friendly = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.";
      } else if (serverMsg) {
        friendly = serverMsg;
      }

      const e = new Error(friendly);
      e.code = status || "LOGIN_FAILED";
      // có thể thêm thông tin tối thiểu để debug nếu cần:
      // if (process.env.NODE_ENV === "development") e.debug = serverMsg || err?.message;

      throw e; // ✅ chỉ ném ra Error với message gọn
    }
  },

  register: async (data) => {
    try {
      const payload = {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth || null,
        gender: data.gender || null,
        avatarUrl: data.avatarUrl || null,
        socialLinks: data.socialLinks || null,
      };

      // 1) Gọi API đăng ký
      const res = await api.post("/api/Auth/register", payload);

      // 2) KHÔNG auto-login, KHÔNG lưu token ở đây
      //    → chỉ coi như đăng ký thành công
      return { ok: true };
    } catch (err) {
      // ❌ Đừng log ra console để tránh lộ lỗi thô
      // console.error(err);

      const status = err?.response?.status;
      const data = err?.response?.data;

      // Một số backend trả về { code, message } hoặc { errors: { Field: [msg] } }
      const code = data?.code || data?.error || "";
      const message = data?.message || "";

      // Gom các khả năng:
      // 409: Conflict (email/username đã tồn tại)
      if (
        status === 409 ||
        /already exists|đã tồn tại/i.test(message) ||
        /exists/i.test(code)
      ) {
        // Ưu tiên phân biệt email vs username (nếu server có)
        if (/email/i.test(message) || /EMAIL/i.test(code)) {
          throw new Error("Email đã tồn tại.");
        }
        if (/username|account|tài khoản/i.test(message)) {
          throw new Error("Tài khoản đã tồn tại.");
        }
        throw new Error("Tài khoản hoặc email đã tồn tại.");
      }

      // 400: Bad Request (vi phạm quy tắc mật khẩu, validate field)
      if (status === 400) {
        // Dạng ModelState: { errors: { Password: ["..."], Email: ["..."] } }
        const errors = data?.errors || data?.Errors;
        const passErr =
          errors?.Password?.[0] ||
          errors?.password?.[0] ||
          (/password/i.test(message) ? message : "");

        if (passErr) {
          throw new Error("Mật khẩu chưa tuân thủ quy tắc.");
        }

        // Lỗi email/username từ modelstate
        const emailErr = errors?.Email?.[0] || errors?.email?.[0];
        if (emailErr && /exist|tồn tại/i.test(emailErr)) {
          throw new Error("Email đã tồn tại.");
        }
        const userErr =
          errors?.Username?.[0] ||
          errors?.username?.[0] ||
          errors?.Account?.[0];
        if (userErr && /exist|tồn tại/i.test(userErr)) {
          throw new Error("Tài khoản đã tồn tại.");
        }

        // Nếu server trả message cụ thể
        if (message) {
          // cố gắng map nhanh
          if (/password/i.test(message))
            return new Error("Mật khẩu chưa tuân thủ quy tắc.");
          if (/email.*exist|đã tồn tại/i.test(message))
            return new Error("Email đã tồn tại.");
          if (/username|account.*exist|đã tồn tại/i.test(message))
            return new Error("Tài khoản đã tồn tại.");
          throw new Error(message);
        }

        throw new Error("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
      }

      // Lỗi mạng
      if (err?.message?.toLowerCase?.().includes("network")) {
        throw new Error(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng."
        );
      }

      // Mặc định
      throw new Error(
        message || "Không thể tạo tài khoản. Vui lòng thử lại sau."
      );
    }
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("auth_state");
    localStorage.removeItem("auth_user");
    set({ user: null });
  },

  ping: async () => (await api.get("/api/Auth/test")).data,
  claims: async () => (await api.get("/api/Auth/claims")).data,
}));
