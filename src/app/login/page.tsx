"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Home } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Нэвтрэх нэр эсвэл нууц үг буруу байна");
      setLoading(false);
      return;
    }

    const callbackUrl = searchParams.get("callbackUrl");
    if (callbackUrl) {
      router.push(callbackUrl);
      return;
    }

    const res = await fetch("/api/auth/session");
    const session = await res.json();
    const role = session?.user?.role;

    if (role === "ADMIN") router.push("/admin");
    else if (role === "TEACHER") router.push("/teacher");
    else if (role === "CHEF") router.push("/chef");
    else if (role === "PARENT") router.push("/parent");
    else router.push("/");
  }

  return (
    <div className="min-h-screen flex bg-[#f7f8fc]">
      {/* ================= LEFT SIDE ================= */}
      <div
        className="hidden md:flex w-1/2 relative overflow-hidden items-center justify-center
        bg-gradient-to-br from-[#6B4EFF]/20 via-[#f1efff] to-indigo-100"
      >
        {/* HOME BUTTON */}
        <button
          onClick={() => router.push("/")}
          className="absolute top-4 left-4 z-50 w-10 h-10 bg-white/70 hover:bg-white
          backdrop-blur rounded-full flex items-center justify-center
          shadow-sm border border-gray-200 transition"
        >
          <Home size={18} className="text-gray-700" />
        </button>

        {/* glow */}
        <div className="absolute w-[500px] h-[500px] bg-[#6B4EFF]/30 blur-[140px] rounded-full top-[-180px] left-[-180px]" />
        <div className="absolute w-[400px] h-[400px] bg-indigo-200/30 blur-[140px] rounded-full bottom-[-160px] right-[-160px]" />

        {/* CONTENT */}
        <div className="relative z-10 text-center max-w-md px-10">
          <h1 className="text-4xl font-semibold text-gray-900 leading-tight">
            СӨБ Систем
          </h1>

          <p className="mt-4 text-gray-600 text-sm">
            Цэцэрлэгийн үйл ажиллагааг нэг платформд төвлөрүүлж, багш болон
            эцэг эхийн хамтын ажиллагааг илүү ухаалаг, хялбар болгоно.
          </p>

          {/* FEATURES */}
          <div className="mt-8 space-y-3 text-sm text-gray-700">
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6B4EFF]" />
              QR ирц автомат бүртгэл
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6B4EFF]" />
              Хүүхдийн хөгжил
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6B4EFF]" />
              Үйл ажиллагааны төлөвлөгөө, тайлан
            </div>
          </div>

          {/* DEVICE MOCKUP */}
          <div className="mt-12 relative flex items-center justify-center">
            {/* LAPTOP */}
            <div className="w-[350px] h-[190px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="h-6 bg-gray-50 border-b flex items-center px-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                </div>
              </div>

              <div className="h-[calc(100%-24px)] flex items-center justify-center">
                <img
                  src="/admin-main.png"
                  alt="Admin Dashboard"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* MOBILE */}
            <div className="w-[110px] h-[220px] bg-white rounded-3xl shadow-xl border border-gray-200 absolute -right-8 -bottom-8 overflow-hidden">
              <div className="h-5 flex justify-center items-center">
                <div className="w-16 h-1 bg-gray-200 rounded-full mt-2"></div>
              </div>

              <div className="flex flex-col items-center justify-center h-full">
                <img
                  src="/login-mobile.png"
                  alt="Mobile preview"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT SIDE ================= */}
      <div
        className="w-full md:w-1/2 flex items-center justify-center px-6
        bg-white md:bg-gray-100
        bg-gradient-to-br md:bg-none from-[#6B4EFF]/20 via-[#f1efff] to-indigo-100"
      >
        <button
          onClick={() => router.push("/")}
          className="absolute top-4 left-4 z-50 w-10 h-10 bg-white/70 hover:bg-white
          backdrop-blur rounded-full flex items-center justify-center
          shadow-sm border border-gray-200 transition"
        >
          <Home size={18} className="text-gray-700" />
        </button>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* BRAND HEADER */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 flex items-center justify-center overflow-hidden">
              <img
                src="/logo1.svg"
                alt="logo"
                className="w-20 h-20 object-contain"
              />
            </div>

            <h1 className="mt-3 text-3xl font-semibold text-gray-900">
              Цахим цэцэрлэг
            </h1>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Нэвтрэх</h2>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs text-gray-500">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#6B4EFF] outline-none"
                  placeholder="Username"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-gray-500">Password</label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#6B4EFF] outline-none"
                    placeholder="••••••••"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <button
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#6B4EFF] text-white font-medium hover:opacity-90 transition"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-6">
              © 2026 СӨБ Систем
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}