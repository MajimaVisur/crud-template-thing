import { useEffect, useState, type JSX } from "react";
// @ts-ignore
import "./index.css";
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import UserPage from "./pages/UserPage";
import AdminPage from "./pages/AdminPage";
import { me as apiMe, logout as apiLogout, getToken, setToken } from "./lib/clientAuth";

function RequireAuth({ user, children }: { user: any | null | undefined; children: JSX.Element }) {
  if (user === undefined) return <div>Checking authentication…</div>;
  if (user === null) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ user, children }: { user: any | null | undefined; children: JSX.Element }) {
  if (user === undefined) return <div>Checking authentication…</div>;
  if (user === null) return <Navigate to="/login" replace />;
  if (!user?.is_admin) return <div className="max-w-md mx-auto p-4 text-destructive">Not authorized. Admins only.</div>;
  return children;
}

function Home() {
  return (
    <div>
      <h1>Home</h1>
      <p>Welcome to the app. Use the links above to register or login.</p>
    </div>
  );
}

export function App() {
  const [user, setUser] = useState<any | null | undefined>(undefined); // undefined = loading

  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const res = await apiMe();
        if (res.ok) setUser(res.data?.user ?? null);
        else {
          setUser(null);
          localStorage.removeItem("token");
        }
      } catch (e) {
        setUser(null);
      }
    })();
  }, []);

  return (
    <BrowserRouter>
      <AppInner user={user} setUser={setUser} />
    </BrowserRouter>
  );
}

function AppInner({ user, setUser }: { user: any | null | undefined; setUser: (u: any) => void }) {
  const navigate = useNavigate();

  const handleAuth = (userData: any, token: string) => {
    try {
      setToken(token);
    } catch (e) { }
    setUser(userData);
    navigate("/user");
  };

  const handleLogout = () => {
    try {
      apiLogout();
      localStorage.removeItem("token");
    } catch (e) { }
    setUser(null);
    navigate("/");
  };

  return (
    <div className="p-4">
      <nav className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <Link to="/" className="text-primary hover:underline">Home</Link>
        {user === null && (
          <>
            <span className="text-muted-foreground">|</span>
            <Link to="/register" className="text-primary hover:underline">Register</Link>
            <span className="text-muted-foreground">|</span>
            <Link to="/login" className="text-primary hover:underline">Login</Link>
          </>
        )}
        <span className="text-muted-foreground">|</span>
        <Link to="/user" className="hover:underline">User</Link>
        <span className="text-muted-foreground">|</span>
        <Link to="/admin" className="hover:underline">Admin</Link>
        {user && (
          <span className="ml-3 flex items-center gap-2 text-sm">
            <span>Logged in as <strong>{user.username}</strong></span>
            <button onClick={handleLogout} className="ml-2 px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm">Logout</button>
          </span>
        )}
      </nav>

      <hr />

      <div className="mt-3">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={user ? <Navigate to="/user" replace /> : <Register onAuth={handleAuth} />} />
          <Route path="/login" element={user ? <Navigate to="/user" replace /> : <Login onAuth={handleAuth} />} />
          <Route path="/user" element={
            <RequireAuth user={user}>
              <UserPage user={user} onLogout={handleLogout} />
            </RequireAuth>
          } />
          <Route path="/admin" element={
            <RequireAuth user={user}>
              <RequireAdmin user={user}>
                <AdminPage user={user} onLogout={handleLogout} />
              </RequireAdmin>
            </RequireAuth>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
