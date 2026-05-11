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
  if (user === undefined) return <div className="mx-auto max-w-md rounded-xl border border-border bg-card/80 p-6 shadow-sm">Checking authentication…</div>;
  if (user === null) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ user, children }: { user: any | null | undefined; children: JSX.Element }) {
  if (user === undefined) return <div className="mx-auto max-w-md rounded-xl border border-border bg-card/80 p-6 shadow-sm">Checking authentication…</div>;
  if (user === null) return <Navigate to="/login" replace />;
  if (!user?.is_admin) return <div className="mx-auto max-w-md rounded-xl border border-border bg-card/80 p-6 text-destructive shadow-sm">Not authorized. Admins only.</div>;
  return children;
}

function Home() {
  return (
    <div className="rounded-xl border border-border bg-card/80 p-6 shadow-sm">
      <h1 className="text-3xl font-semibold tracking-tight">Home</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
        Welcome to the app. Use the links above to register or login.
      </p>
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
    <div className="min-h-screen bg-[linear-gradient(180deg,oklch(0.99_0.004_85),oklch(0.97_0.006_85))] p-4">
      <nav className="mx-auto mb-4 flex w-full max-w-5xl flex-wrap items-center gap-2 rounded-xl border border-border bg-background/90 p-3 text-sm shadow-sm">
        <Link to="/" className="rounded-md px-3 py-1.5 font-medium text-primary transition hover:bg-accent hover:text-accent-foreground">Home</Link>
        {user === null && (
          <>
            <span className="text-muted-foreground">|</span>
            <Link to="/register" className="rounded-md px-3 py-1.5 font-medium text-primary transition hover:bg-accent hover:text-accent-foreground">Register</Link>
            <span className="text-muted-foreground">|</span>
            <Link to="/login" className="rounded-md px-3 py-1.5 font-medium text-primary transition hover:bg-accent hover:text-accent-foreground">Login</Link>
          </>
        )}
        <span className="text-muted-foreground">|</span>
        <Link to="/user" className="rounded-md px-3 py-1.5 transition hover:bg-accent hover:text-accent-foreground">User</Link>
        <span className="text-muted-foreground">|</span>
        <Link to="/admin" className="rounded-md px-3 py-1.5 transition hover:bg-accent hover:text-accent-foreground">Admin</Link>
        {user && (
          <span className="ml-auto flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm">
            <span>Logged in as <strong>{user.username}</strong></span>
            <button onClick={handleLogout} className="rounded-md border border-border px-2 py-1 text-sm transition hover:bg-accent">Logout</button>
          </span>
        )}
      </nav>

      <hr className="mx-auto max-w-5xl border-border/80" />

      <div className="mx-auto mt-4 w-full max-w-5xl rounded-xl border border-border bg-background/90 p-4 shadow-sm sm:p-6">
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
