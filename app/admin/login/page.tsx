"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(login, null);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8f1ef] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-[#8d726d] mb-2">
            Auren
          </p>
          <h1 className="text-2xl font-semibold text-[#3d2c2c]">
            Panel administrativo
          </h1>
          <p className="mt-1 text-sm text-[#6f5a56]">
            Ingresa la contraseña para continuar
          </p>
        </div>

        <form
          action={action}
          className="bg-white border border-[#ead7d1] rounded-2xl p-8 shadow-sm space-y-5"
        >
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-[#3d2c2c]"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              placeholder="••••••••"
              className="w-full rounded-lg border border-[#ead7d1] bg-[#fdf8f7] px-4 py-2.5 text-sm text-[#3d2c2c] placeholder-[#c4a8a3] outline-none focus:border-[#b07c75] focus:ring-2 focus:ring-[#ead7d1] transition"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-[#3d2c2c] py-2.5 text-sm font-medium text-white hover:bg-[#5a3e3e] disabled:opacity-60 transition"
          >
            {pending ? "Verificando…" : "Ingresar"}
          </button>
        </form>
      </div>
    </main>
  );
}
