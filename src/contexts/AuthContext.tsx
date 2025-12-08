import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type User = {
  fullName: string;
  email: string;
  // nếu sau này BE trả thêm role, id... thì thêm vào đây
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  reloadUser: () => Promise<void>; // gọi lại /current
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Hàm gọi API /current, dùng lại nhiều chỗ
  const fetchCurrentUser = async (token: string) => {
    try {
      const res = await fetch("http://localhost:8080/api/v1/auth/current", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser({
        fullName: data.fullName,
        email: data.email,
      });

      // lưu thêm cho vui (nếu bạn đang dùng ở chỗ khác)
      localStorage.setItem("fullName", data.fullName);
      localStorage.setItem("email", data.email);
    } catch (err) {
      console.error("Lỗi gọi /current:", err);
      setUser(null);
    }
  };

  // Hàm public cho các component khác gọi (ví dụ LoginPage)
  const reloadUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return;
    }
    await fetchCurrentUser(token);
  };

  // Khi mở web lần đầu → kiểm tra luôn xem có token + user hay không
  useEffect(() => {
    (async () => {
      await reloadUser();
      setLoading(false);
    })();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("fullName");
    localStorage.removeItem("email");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, reloadUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// hook dùng trong các component
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng trong AuthProvider");
  return ctx;
};
