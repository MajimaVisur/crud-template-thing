import React, { useState } from "react";
import { login as apiLogin, setToken } from "@/lib/clientAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function Login({ onAuth }: { onAuth?: (user: any, token: string) => void }) {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await apiLogin(emailOrUsername, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.data?.error || "Login failed");
      return;
    }
    const { user, token } = res.data ?? {};
    if (token) {
      try { setToken(token); } catch (e) { }
      onAuth && onAuth(user, token);
    } else {
      setError("Login succeeded but no token returned");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-1">
          <Label htmlFor="emailOrUsername">Email or Username</Label>
          <Input id="emailOrUsername" value={emailOrUsername} onChange={(e) => setEmailOrUsername(e.target.value)} />
        </div>

        <div className="grid gap-1">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div>
          <Button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}
      </form>
    </div>
  );
}

export default Login;
