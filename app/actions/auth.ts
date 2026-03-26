"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "admin_session";

async function signToken(secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const payload = `admin:${Date.now()}`;
  const payloadB64 = Buffer.from(payload).toString("base64url");
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );
  const sigB64 = Buffer.from(signature).toString("base64url");
  return `${payloadB64}.${sigB64}`;
}

export async function login(_: unknown, formData: FormData) {
  const password = formData.get("password") as string;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SECRET;

  if (!adminPassword || !secret) {
    return { error: "El servidor no está configurado correctamente." };
  }

  if (password !== adminPassword) {
    return { error: "Contraseña incorrecta." };
  }

  const token = await signToken(secret);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 horas
  });

  redirect("/admin");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/admin/login");
}
