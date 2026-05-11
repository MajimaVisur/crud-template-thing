import React from "react";
import { Button } from "@/components/ui/button";

export function AdminPage({ user, onLogout }: { user: any; onLogout?: () => void }) {
  if (!user?.is_admin) {
    return (
      <div className="mx-auto max-w-md rounded-xl border bg-card/80 p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Admin Area</h2>
        <p className="text-destructive">Not authorized. Admins only.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border bg-card/80 p-6 shadow-sm">
      <h2 className="text-2xl font-semibold">Admin Area</h2>
      <p className="mt-2">Welcome, admin <strong>{user?.username}</strong>.</p>
      <p>This is protected admin content.</p>
      <div className="mt-4">
        <Button variant="destructive" onClick={() => onLogout && onLogout()}>
          Logout
        </Button>
      </div>
    </div>
  );
}

export default AdminPage;
