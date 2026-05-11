import React, { useState } from "react";
import { register as apiRegister, setToken } from "@/lib/clientAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function Register({ onAuth }: { onAuth?: (user: any, token: string) => void }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPasswordState] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await apiRegister(username, email, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.data?.error || "Registration failed");
      return;
    }
    const { user, token } = res.data ?? {};
    if (token) {
      try { setToken(token); } catch (e) { }
      onAuth && onAuth(user, token);
    } else {
      setError("Registration succeeded but no token returned");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Register</h2>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-1">
          <Label htmlFor="username">Username</Label>
          <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>

        <div className="grid gap-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="grid gap-1">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPasswordState(e.target.value)} />
        </div>

        <div>
          <Button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </Button>
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}
      </form>
    </div>
  );
}

export default Register;
