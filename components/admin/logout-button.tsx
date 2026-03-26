"use client";

import { logout } from "@/app/actions/auth";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="text-xs text-[#8d726d] hover:text-[#6f4b46] underline underline-offset-2 transition"
      >
        Cerrar sesión
      </button>
    </form>
  );
}
