import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type User = {
  id: number;
  fullName: string;
  email: string;
  roles: string[];
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  reloadUser: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const fetchCurrentUser = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/current`, {
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
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        roles: data.roles || [],
      });

      localStorage.setItem("fullName", data.fullName);
      localStorage.setItem("email", data.email);
    } catch (err) {
      console.error("Lỗi gọi /current:", err);
      setUser(null);
    }
  };

  const reloadUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return;
    }
    await fetchCurrentUser(token);
  };

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

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng trong AuthProvider");
  return ctx;
};
