import React from "react";
import { Button } from "@/components/ui/button";

export function UserPage({ user, onLogout }: { user: any; onLogout?: () => void }) {
  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-semibold">User Area</h2>
      <p className="mt-2">Welcome, <strong>{user?.username ?? "user"}</strong>!</p>
      <p>Email: {user?.email}</p>
      <p>Admin: {user?.is_admin ? "Yes" : "No"}</p>
      <div className="mt-4">
        <Button variant="outline" onClick={() => onLogout && onLogout()}>
          Logout
        </Button>
      </div>
    </div>
  );
}

export default UserPage;
