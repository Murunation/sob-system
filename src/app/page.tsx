"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import DemoForm from "../components/ui/DemoForm"; // 👈 ADD THIS

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function HomePage() {
  const router = useRouter();

  // ===== MODAL STATE =====
  const [openDemo, setOpenDemo] = useState(false);

  // ===== SECTIONS =====
  const whatRef = useRef<HTMLDivElement | null>(null);
  const whyRef = useRef<HTMLDivElement | null>(null);
  const serviceRef = useRef<HTMLDivElement | null>(null);
  const tourRef = useRef<HTMLDivElement | null>(null);
  const priceRef = useRef<HTMLDivElement | null>(null);
  const aboutRef = useRef<HTMLDivElement | null>(null);

  const scrollTo = (ref: any) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="bg-[#f7f8fc] text-gray-900 relative overflow-hidden">

      {/* BACKGROUND */}
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 12 }}
        className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-[#6B4EFF]/20 blur-[140px] rounded-full"
      />

      <motion.div
        animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 15 }}
        className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-indigo-200/30 blur-[140px] rounded-full"
      />

      {/* NAVBAR */}
      <header className="fixed top-0 left-0 w-full bg-white/60 backdrop-blur border-b z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

          <h1 className="font-semibold text-lg">
            <span className="text-[#6B4EFF]">SOB System</span>
          </h1>

          <nav className="hidden md:flex gap-6 text-sm text-gray-600">
            <button onClick={() => scrollTo(whatRef)}>СӨБ гэж юу вэ?</button>
            <button onClick={() => scrollTo(whyRef)}>Яагаад СӨБ?</button>
            <button onClick={() => scrollTo(serviceRef)}>Үйлчилгээ</button>
            <button onClick={() => scrollTo(tourRef)}>Заавар</button>
            <button onClick={() => scrollTo(priceRef)}>Үнэ</button>
            <button onClick={() => scrollTo(aboutRef)}>Бидний тухай</button>
          </nav>

          <div className="flex gap-3">
            {/* 🔥 DEMO BUTTON OPENS MODAL */}
            <button
              onClick={() => setOpenDemo(true)}
              className="px-4 py-2 border rounded-xl text-sm hover:bg-gray-100"
            >
              Туршиж үзэх
            </button>

            <button
              onClick={() => router.push("/login")}
              className="px-4 py-2 bg-[#6B4EFF] text-white rounded-xl text-sm"
            >
              Нэвтрэх
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="pt-32 pb-24 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

        <motion.div initial="hidden" animate="show" variants={container}>

          <motion.h1 variants={item} className="text-5xl font-semibold">
            Ухаалаг <span className="text-[#6B4EFF]">цэцэрлэгийн систем</span>
          </motion.h1>

          <motion.p variants={item} className="mt-6 text-gray-600 text-lg">
            QR ирц, харилцаа, төлбөр, тайлан — бүгд нэг системд.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex gap-4">
            <button
              onClick={() => setOpenDemo(true)}
              className="px-6 py-3 bg-[#6B4EFF] text-white rounded-xl"
            >
              Туршиж үзэх
            </button>

            <button
              onClick={() => router.push("/login")}
              className="px-6 py-3 border rounded-xl"
            >
              Нэвтрэх
            </button>
          </motion.div>
        </motion.div>

        <motion.div
  className="h-[400px] md:h-[700px] flex items-center justify-center px-4"
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
>
  <img
    src="/admin-main-mockups.png"
    alt="App Preview"
    className="h-full w-auto object-cover"
  />
</motion.div>
      </section>

      {/* SECTIONS (unchanged) */}
      <section ref={whatRef} className="py-24 max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-semibold">What is SOB System?</h2>
      </section>

      <section ref={whyRef} className="bg-white py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-semibold">Why choose us?</h2>
        </div>
      </section>

      <section ref={serviceRef} className="py-24 max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-semibold">Services</h2>
      </section>

      <section ref={tourRef} className="bg-gray-50 py-24 text-center">
        <h2 className="text-3xl font-semibold">Product Tour</h2>
      </section>

      <section ref={priceRef} className="py-24 max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-semibold text-center">Pricing</h2>
      </section>

      <section ref={aboutRef} className="bg-gray-50 py-24 text-center">
        <h2 className="text-3xl font-semibold">About us</h2>
      </section>

      {/* ===== MODAL ===== */}
      {openDemo && (
        <DemoForm onClose={() => setOpenDemo(false)} />
      )}

      <footer className="py-10 text-center text-gray-500 text-sm">
        © 2026 SOB System
      </footer>
    </main>
  );
}