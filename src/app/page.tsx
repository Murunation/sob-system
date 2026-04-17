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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    {/* LOGO */}
    <div className="flex items-center gap-2">
      <img
        src="/logo1.svg"
        alt="SOB System Logo"
        className="w-8 h-8 object-contain"
      />

      <h1 className="hidden sm:block font-semibold text-lg">
        <span className="text-[#6B4EFF]">SOB System</span>
      </h1>
    </div>

    {/* DESKTOP MENU */}
    <nav className="hidden md:flex gap-6 text-sm text-gray-600">
      <button onClick={() => scrollTo(whatRef)}>СӨБ гэж юу вэ?</button>
      <button onClick={() => scrollTo(whyRef)}>Яагаад СӨБ?</button>
      <button onClick={() => scrollTo(serviceRef)}>Үйлчилгээ</button>
      <button onClick={() => scrollTo(tourRef)}>Заавар</button>
      <button onClick={() => scrollTo(priceRef)}>Үнэ</button>
      <button onClick={() => scrollTo(aboutRef)}>Бидний тухай</button>
    </nav>

    {/* RIGHT ACTIONS */}
    <div className="flex items-center gap-3">

      {/* MOBILE MENU BUTTON */}
      <button
        className="md:hidden p-2"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        ☰
      </button>

      <button
        onClick={() => setOpenDemo(true)}
        className="px-4 py-2 border rounded-xl text-sm hover:bg-gray-100 hidden sm:block"
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

  {/* MOBILE MENU DROPDOWN */}
  {mobileMenuOpen && (
    <div className="md:hidden bg-white border-t px-6 py-4 space-y-3 text-sm text-gray-700 flex flex-col ">
      <button onClick={() => { scrollTo(whatRef); setMobileMenuOpen(false); }}>
        СӨБ гэж юу вэ?
      </button>

      <button onClick={() => { scrollTo(whyRef); setMobileMenuOpen(false); }}>
        Яагаад СӨБ?
      </button>

      <button onClick={() => { scrollTo(serviceRef); setMobileMenuOpen(false); }}>
        Үйлчилгээ
      </button>

      <button onClick={() => { scrollTo(tourRef); setMobileMenuOpen(false); }}>
        Заавар
      </button>

      <button onClick={() => { scrollTo(priceRef); setMobileMenuOpen(false); }}>
        Үнэ
      </button>

      <button onClick={() => { scrollTo(aboutRef); setMobileMenuOpen(false); }}>
        Бидний тухай
      </button>
    </div>
  )}
</header>

      {/* HERO */}
      <section className="pt-32 pb-12 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
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
      {/* What is SOB section */}
      <section
        ref={whatRef}
        className="py-24 bg-white relative overflow-hidden"
      >
        <div className="max-w-6xl mx-auto px-6">
          {/* TITLE */}
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              <span className="text-[#6B4EFF]">СӨБ систем</span> гэж юу вэ?
            </h2>

            <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
              Багш, Удирдлага, Эцэг эхийг нэг системд холбосон сургуулийн өмнөх
              боловсролын байгууллагын нэгдсэн мэдээллийн систем.
            </p>
          </div>

          {/* CONTENT GRID */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* LEFT TEXT */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl border bg-gray-50 hover:bg-white transition shadow-sm">
                <h3 className="font-semibold text-lg">📱 QR ирц</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Эцэг эхчүүд хүүхдүүдээ QR код ашиглан ирцийг бүртгэнэ. Гараар
                  бичиг цаас гэх шаардлагагүй.
                </p>
              </div>

              <div className="p-6 rounded-2xl border bg-gray-50 hover:bg-white transition shadow-sm">
                <h3 className="font-semibold text-lg">
                  💬 Эцэг эхийн харилцаа холбоо
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  Багш нар болон эцэг эхчүүд хүүхдийн өдөр тутмын үйл ажиллагаа,
                  хөгжил, мэдээ мэдээллийг шуурхай хуваалцаж, харилцан яриа
                  өрнүүлэх боломжтой.
                </p>
              </div>

              <div className="p-6 rounded-2xl border bg-gray-50 hover:bg-white transition shadow-sm">
                <h3 className="font-semibold text-lg">
                  💳 Төлбөрийн ухаалаг шийдэл
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  Хүүхэд бүрийн сарын төлбөрийг тодорхой төлсөн/төлөөгүй
                  статусын хамт хянах боломжтой.
                </p>
              </div>
            </div>

            {/* RIGHT VISUAL */}
            <div className="relative">
              <div className="h-[300px] md:h-[420px] rounded-3xl border bg-gradient-to-br from-[#6B4EFF]/10 via-white to-indigo-100 flex items-center justify-center shadow-sm overflow-hidden">
                <img
                  src="/admin-main.png"
                  alt="System preview"
                  className="w-full h-full object-contain p-6"
                />
              </div>

              {/* floating badge */}
              <div className="absolute -bottom-4 left-4 bg-white border shadow-sm rounded-xl px-4 py-2 text-xs text-gray-600">
                🚀 Бүгдийг нэг дороос
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Why choose us section*/}
      <section
        ref={whyRef}
        className="py-24 bg-gray-50 relative overflow-hidden"
      >
        <div className="max-w-6xl mx-auto px-6">
          {/* TITLE */}
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Яагаад <span className="text-[#6B4EFF]">биднийг сонгох вэ?</span>
            </h2>

            <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
              Бид цэцэрлэгийн үйл ажиллагааг автоматжуулж, ил тод, хялбар,
              ухаалаг систем болгон нэгтгэсэн.
            </p>
          </div>

          {/* FEATURES GRID */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl border shadow-sm hover:shadow-md hover:-translate-y-1 transition">
              <div className="text-3xl">⚡</div>
              <h3 className="mt-4 font-semibold text-lg">
                Хурдан бөгөөд хялбар
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Бүх үйлдэл маш хурдан, энгийн алхмуудаар хийгдэнэ.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border shadow-sm hover:shadow-md hover:-translate-y-1 transition">
              <div className="text-3xl">🔒</div>
              <h3 className="mt-4 font-semibold text-lg">Аюулгүй байдал</h3>
              <p className="text-sm text-gray-600 mt-2">
                Хүүхэд болон эцэг эхийн мэдээлэл бүрэн хамгаалагдсан.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border shadow-sm hover:shadow-md hover:-translate-y-1 transition">
              <div className="text-3xl">📊</div>
              <h3 className="mt-4 font-semibold text-lg">Ухаалаг тайлан</h3>
              <p className="text-sm text-gray-600 mt-2">
                Ирц, төлбөр, хөгжил гээд бүх мэдээллийг бодит цагт харна.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border shadow-sm hover:shadow-md hover:-translate-y-1 transition">
              <div className="text-3xl">💬</div>
              <h3 className="mt-4 font-semibold text-lg">
                Эцэг эхийн харилцаа
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Багш болон эцэг эх шууд, хурдан холбогдоно.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border shadow-sm hover:shadow-md hover:-translate-y-1 transition">
              <div className="text-3xl">💳</div>
              <h3 className="mt-4 font-semibold text-lg">Төлбөрийн хяналт</h3>
              <p className="text-sm text-gray-600 mt-2">
                Хүүхэд бүрийн төлбөрийг тодорхой, ойлгомжтой хянах боломжтой.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border shadow-sm hover:shadow-md hover:-translate-y-1 transition">
              <div className="text-3xl">🚀</div>
              <h3 className="mt-4 font-semibold text-lg">Өргөтгөх боломжтой</h3>
              <p className="text-sm text-gray-600 mt-2">
                Жижигээс том байгууллага хүртэл тохиромжтой систем.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Service section*/}
      <section ref={serviceRef} className="py-24 bg-white">
  <div className="max-w-6xl mx-auto px-6">

    {/* TITLE */}
    <div className="text-center mb-14">
      <h2 className="text-3xl md:text-4xl font-semibold">
        Үндсэн <span className="text-[#6B4EFF]">үйлчилгээнүүд</span>
      </h2>

      <p className="mt-3 text-gray-600 text-sm md:text-base">
        Цэцэрлэгийн бүх үйл ажиллагааг нэг системд ухаалгаар удирдана.
      </p>
    </div>

    {/* CONTENT */}
    <div className="space-y-20">

      {/* 1 */}
      <div className="flex flex-col md:flex-row items-center gap-10">
  <div className="flex-1">
    <h3 className="text-2xl font-semibold">📱 QR Ирцийн систем</h3>
    <p className="mt-3 text-gray-600">
      Хүүхдийн ирцийг QR кодоор хурдан, автомат бүртгэнэ.
    </p>
  </div>
  <div className="flex-1 h-[220px] md:h-[280px] rounded-3xl border overflow-hidden">
    <img
      src="/qr-attandance.png"
      alt="QR ирцийн систем"
      className="w-full h-full object-cover"
    />
  </div>
</div>

      {/* 2 (reverse) */}
      <div className="flex flex-col md:flex-row-reverse items-center gap-10">
        <div className="flex-1">
          <h3 className="text-2xl font-semibold">💬 Эцэг эхийн харилцаа</h3>
          <p className="mt-3 text-gray-600">
            Багш болон эцэг эх хооронд шууд мэдээлэл солилцоно.
          </p>
        </div>
        <div className="flex-1 h-[220px] md:h-[280px] rounded-3xl border overflow-hidden">
    <img
      src="/conversation-parent.png"
      alt="Эцэг эхийн харилцаа"
      className="w-full h-full object-cover"
    />
  </div>
      </div>

      {/* 3 */}
      <div className="flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1">
          <h3 className="text-2xl font-semibold">💳 Төлбөрийн удирдлага</h3>
          <p className="mt-3 text-gray-600">
            Хүүхэд бүрийн төлбөрийг тодорхой, ил тод хянах боломжтой.
          </p>
        </div>
        <div className="flex-1 h-[220px] md:h-[280px] rounded-3xl border overflow-hidden">
    <img
      src="/payment.png"
      alt="Төлбөрийн удирдлага"
      className="w-full h-full object-cover"
    />
  </div>
      </div>

      {/* 4 (reverse) */}
      <div className="flex flex-col md:flex-row-reverse items-center gap-10">
        <div className="flex-1">
          <h3 className="text-2xl font-semibold">📊 Тайлан, анализ</h3>
          <p className="mt-3 text-gray-600">
            Ирц, төлбөр, хөгжлийн ухаалаг тайлан харуулна.
          </p>
        </div>
        <div className="flex-1">
          <img
            src="/report.png"
            alt="Тайлан, анализ"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

    </div>

  </div>
</section>
{/* Tour section*/}
      <section ref={tourRef} className="py-24 bg-gray-50">
  <div className="max-w-6xl mx-auto px-6">

    {/* TITLE */}
    <div className="text-center mb-14">
      <h2 className="text-3xl md:text-4xl font-semibold">
        Бүтээгдэхүүний <span className="text-[#6B4EFF]">танилцуулга</span>
      </h2>
    </div>

    {/* VIDEO CARD */}
    <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden border shadow-lg bg-black">

      {/* VIDEO */}
      <video
        className="w-full h-[220px] md:h-[420px] object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/Promo.mp4" type="video/mp4" />
      </video>

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

      {/* TEXT OVER VIDEO */}
      <div className="absolute bottom-6 left-6 text-white">
        <h3 className="text-lg md:text-2xl font-semibold">
          СӨБ систем
        </h3>
        <p className="text-xs md:text-sm opacity-80">
          Ирц • Харилцаа
        </p>
      </div>

      {/* PLAY BADGE */}
      <div className="absolute top-4 right-4 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-white text-xs">
        ▶ Заавар бичлэг
      </div>
    </div>

  </div>
</section>
{/*Pricing section*/}
<section ref={priceRef} className="py-24 bg-white">
  <div className="max-w-6xl mx-auto px-6">

    {/* TITLE */}
    <div className="text-center mb-14">
  <h2 className="text-3xl md:text-4xl font-semibold">
    Үнийн <span className="text-[#6B4EFF]">багцууд</span>
  </h2>

  <p className="mt-3 text-gray-600 text-sm md:text-base">
    Сар, жил болон уян хатан багцаас сонгох боломжтой.
  </p>

  {/* 💖 SPECIAL SUPPORT BADGE */}
  <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 text-pink-600 text-sm font-medium border border-pink-100">
    ❤️ Тусгай хэрэгцээт хүүхдүүдтэй цэцэрлэгүүдэд үнийн дүнгээс
    <span className="ml-1 px-2 py-1 rounded-full bg-pink-500 text-white text-xs font-semibold animate-pulse">
      90% ХӨНГӨЛӨЛТ
    </span>
  </div>
</div>

    {/* CARDS */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

      {/* MONTHLY */}
      <div className="rounded-3xl border p-8 shadow-sm hover:shadow-xl transition bg-white">
        <h3 className="text-xl font-semibold">📅 Сарын багц</h3>

        <p className="mt-2 text-gray-600 text-sm">
          Сар бүр төлбөр төлөх уян хатан сонголт.
        </p>

        <div className="mt-6 text-3xl font-semibold text-[#6B4EFF]">
          499.999₮
        </div>

        <ul className="mt-6 space-y-2 text-sm text-gray-600">
          <li>✔ QR Ирц</li>
          <li>✔ Эцэг эхийн харилцаа</li>
          <li>✔ Төлбөрийн систем</li>
          <li>✔ Тайлан</li>
        </ul>
      </div>

      {/* YEARLY (HIGHLIGHT) */}
      <div className="rounded-3xl border p-8 shadow-lg bg-gradient-to-br from-[#6B4EFF]/5 to-indigo-50 relative hover:shadow-xl transition">

        <div className="absolute top-4 right-4 bg-[#6B4EFF] text-white text-xs px-3 py-1 rounded-full">
          Хэмнэлттэй
        </div>

        <h3 className="text-xl font-semibold">📆 Жилийн багц</h3>

        <p className="mt-2 text-gray-600 text-sm">
          12 сарын багц — илүү хямд, илүү тогтвортой.
        </p>

        <div className="mt-6 text-3xl font-semibold text-[#6B4EFF]">
          1.499.999₮
        </div>

        <ul className="mt-6 space-y-2 text-sm text-gray-600">
          <li>✔ QR Ирц</li>
          <li>✔ Эцэг эхийн харилцаа</li>
          <li>✔ Төлбөрийн систем</li>
          <li>✔ Тайлан</li>
          <li>✔ Priority support</li>
        </ul>
      </div>

      {/* FLEXIBLE / CONTACT */}
      <div className="rounded-3xl border p-8 shadow-sm hover:shadow-xl transition bg-white">

        <h3 className="text-xl font-semibold">💡 Уян хатан багц</h3>

        <p className="mt-2 text-gray-600 text-sm">
          Танай байгууллагын хэмжээ, хэрэглээнд тохируулж үнийн санал гаргана.
        </p>

        <div className="mt-6 text-lg font-semibold text-gray-700">
          Бидэнтэй холбогдоорой
        </div>

        <ul className="mt-6 space-y-2 text-sm text-gray-600">
          <li>✔ Модулийн тохиргоог өөрчлөх</li>
          <li>✔ Холболт</li>
          <li>✔ Байгууллагын онцлогууд</li>
          <li>✔ Тусгай дэмжлэг</li>
        </ul>

        <button className="mt-6 w-full py-3 bg-[#6B4EFF] text-white rounded-xl hover:opacity-90 transition" onClick={() => setOpenDemo(true)}>
          Туршиж үзэх
        </button>
      </div>

    </div>
  </div>
</section>
{/*Coming soon section*/}
{/* COMING SOON SECTION */}
<section className="py-24 bg-gray-50 relative overflow-hidden">
  <div className="max-w-6xl mx-auto px-6">

    {/* TITLE */}
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-semibold">
        Удахгүй <span className="text-[#6B4EFF]">нэмэгдэх</span>
      </h2>

      <p className="mt-4 text-gray-600 text-sm md:text-base">
        Бид системээ илүү өргөжүүлж, дараах боломжуудыг нэмэхээр төлөвлөж байна.
      </p>
    </div>

    {/* CARDS */}
    <div className="grid md:grid-cols-2 gap-8">

      {/* SOB Learning */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8, scale: 1.02 }}
        viewport={{ once: true }}
        className="p-8 rounded-3xl border bg-white shadow-sm hover:shadow-xl transition relative overflow-hidden"
      >
        <div className="absolute top-4 right-4 text-xs px-3 py-1 bg-[#6B4EFF]/10 text-[#6B4EFF] rounded-full">
          Coming Soon
        </div>

        <div className="text-3xl">📚</div>

        <h3 className="mt-4 text-xl font-semibold">
          SOB Learning
        </h3>

        <p className="mt-3 text-gray-600 text-sm">
          Хүүхэд болон багшийн хөгжлийг дэмжих сургалтын платформ.
        </p>
      </motion.div>

      {/* SOB Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8, scale: 1.02 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="p-8 rounded-3xl border bg-white shadow-sm hover:shadow-xl transition relative overflow-hidden"
      >
        <div className="absolute top-4 right-4 text-xs px-3 py-1 bg-[#6B4EFF]/10 text-[#6B4EFF] rounded-full">
          Coming Soon
        </div>

        <div className="text-3xl">🎥</div>

        <h3 className="mt-4 text-xl font-semibold">
          SOB Content
        </h3>

        <p className="mt-3 text-gray-600 text-sm">
          Хүүхдүүд зориулсан сургалтын видео, материал, контентуудыг нэг дороос авах боломж.
        </p>
      </motion.div>

    </div>
  </div>
</section>
    {/*About us*/}
<section ref={aboutRef} className="bg-gray-50 py-24">
  <div className="max-w-5xl mx-auto px-6">

    {/* TITLE */}
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-semibold">
        Бидний <span className="text-[#6B4EFF]">тухай</span>
      </h2>

      <p className="mt-3 text-gray-600 text-sm md:text-base">
        Бидний хөгжүүлж буй энэхүү систем нь цэцэрлэгийн үйл ажиллагааг илүү ухаалаг, хялбар болгох зорилготой.
      </p>
    </div>

    {/* MAIN CARD */}
    <div className="bg-white rounded-3xl border shadow-sm p-8 md:p-12 relative overflow-hidden">

      {/* soft glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#6B4EFF]/10 rounded-full blur-3xl" />

      <div className="relative">

        {/* ROLE */}
        <h3 className="text-xl md:text-2xl font-semibold">
          👨‍💻 МУИС-ийн оюутан, Хөгжүүлэгч: Баттулга овогтой Мөрөн
        </h3>

        {/* DESCRIPTION */}
        <p className="mt-4 text-gray-600 leading-relaxed text-sm md:text-base">
          Би энэ системийг цэцэрлэгийн өдөр тутмын үйл ажиллагаанд тулгардаг асуудлуудыг шийдэх зорилгоор бие даан хөгжүүлж байна.
          QR ирц, эцэг эхийн харилцаа, төлбөрийн удирдлага болон тайлангийн системийг нэг дор нэгтгэж,
          илүү энгийн, хурдан, ухаалаг шийдэл бий болгохыг зорьсон.
        </p>

        {/* HIGHLIGHT BOX */}
        <div className="mt-8 p-5 rounded-2xl bg-gray-50 border">
          <p className="text-sm text-gray-700">
            💡 Миний зорилго бол зөвхөн програм хийх биш —
            <span className="font-semibold text-[#6B4EFF]">
              {" "}бодит асуудлыг шийдсэн бүтээгдэхүүн бүтээх{" "}
            </span>
            юм.
          </p>
        </div>

        {/* FOOTER LINE */}
        <div className="mt-10 flex items-center justify-between text-sm text-gray-500 flex-col sm:flex-row gap-2">
          <span>🚀 Сургуулийн өмнөх боловсролын байгууллагын нэгдсэн мэдээллийн систем </span>
          <span>2026</span>
        </div>

      </div>
    </div>

  </div>
</section>

      {/* ===== MODAL ===== */}
      {openDemo && <DemoForm onClose={() => setOpenDemo(false)} />}

      <footer className="bg-white border-t py-12">
  <div className="max-w-6xl mx-auto px-6">

    {/* TOP GRID */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

      {/* BRAND */}
      <div>
        <div className="flex items-center gap-2">
          <img
    src="/logo1.svg"
    alt="SOB System Logo"
    className="w-8 h-8 object-contain"
  />
        <h3 className="text-lg font-semibold text-[#6B4EFF]">
          SOB System
        </h3>
        </div>
        

        <p className="mt-3 text-sm text-gray-600 leading-relaxed">
          Сургуулийн өмнөх боловсролын байгууллагын нэгдсэн мэдээллийн систем.
        </p>
      </div>

      {/* NAVIGATION */}
      <div>
        <h4 className="font-semibold mb-3">Холбоосууд</h4>

        <ul className="space-y-2 text-sm text-gray-600">
          <li><a href="#what" className="hover:text-[#6B4EFF]" onClick={() => scrollTo(whatRef)}>СӨБ гэж юу вэ?</a></li>
          <li><a href="#why" className="hover:text-[#6B4EFF]" onClick={() => scrollTo(whyRef)}>Яагаад СӨБ?</a></li>
          <li><a href="#service" className="hover:text-[#6B4EFF]" onClick={() => scrollTo(serviceRef)}>Үйлчилгээ</a></li>
          <li><a href="#price" className="hover:text-[#6B4EFF]" onClick={() => scrollTo(priceRef)}>Үнэ</a></li>
          <li><a href="#about" className="hover:text-[#6B4EFF]" onClick={() => scrollTo(aboutRef)}>Бидний тухай</a></li>
        </ul>
      </div>

      {/* CTA */}
      <div>
        <h4 className="font-semibold mb-3">Эхлэх</h4>

        <div className="flex flex-col gap-3">
          <button className="px-4 py-2 rounded-xl bg-[#6B4EFF] text-white text-sm hover:opacity-90" onClick={() => setOpenDemo(true)}>
            Туршиж үзэх
          </button>

          <button onClick={() => router.push("/login")} className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-50">
            Нэвтрэх
          </button>
        </div>
      </div>

      {/* SOCIAL */}
      <div>
        <h4 className="font-semibold mb-3">Холбоо барих</h4>

        <div className="flex gap-3 text-gray-600">

          {/* Facebook */}
          <a href="https://www.facebook.com/nuuz.az" target="_blank" className="hover:text-[#6B4EFF]">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 12a10 10 0 10-11.5 9.9v-7H8v-3h2.5V9.5C10.5 7 12 5.5 14.2 5.5c1 0 2 .2 2 .2v2.2h-1.2c-1.2 0-1.6.8-1.6 1.6V12H18l-.5 3h-2.4v7A10 10 0 0022 12z"/>
            </svg>
          </a>

          {/* Instagram */}
          <a href="https://www.instagram.com/murunation/" target="_blank" className="hover:text-[#6B4EFF]">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm10 2H7a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3zm-5 4a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6zm5.5-3a1 1 0 110 2 1 1 0 010-2z"/>
            </svg>
          </a>

          {/* LinkedIn */}
          <a href="https://www.linkedin.com/in/murun-battulga-752673305/" target="_blank" className="hover:text-[#6B4EFF]">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.95v5.66H9.37V9h3.41v1.56h.05c.48-.9 1.65-1.85 3.4-1.85 3.64 0 4.32 2.4 4.32 5.51v6.23zM5.34 7.43a2.07 2.07 0 11.01-4.14 2.07 2.07 0 01-.01 4.14zM6.9 20.45H3.78V9h3.12v11.45z"/>
            </svg>
          </a>

          {/* Gmail */}
          <a href="mailto:murunbattulga6@gmail.com" target="_blank" className="hover:text-[#6B4EFF]">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </a>

        </div>
      </div>

    </div>

    {/* BOTTOM */}
    <div className="mt-10 pt-6 border-t text-center text-xs text-gray-500">
      © 2026 СӨБ систем — Бүх эрх хуулиар хамгаалагдсан
    </div>

  </div>
</footer>
    </main>
  );
}
