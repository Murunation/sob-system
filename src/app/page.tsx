"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import DemoForm from "../components/ui/DemoForm";

// ── Shared animation variants ──────────────────────────────────────────────

const vp = { once: true, margin: "-80px" };
const ease = { duration: 0.65, ease: "easeOut" as const };

const fromLeft   = { hidden: { opacity: 0, x: -70 }, show: { opacity: 1, x: 0, transition: ease } };
const fromRight  = { hidden: { opacity: 0, x:  70 }, show: { opacity: 1, x: 0, transition: ease } };
const fromBottom = { hidden: { opacity: 0, y:  60 }, show: { opacity: 1, y: 0, transition: ease } };
const scaleIn    = { hidden: { opacity: 0, scale: 0.92 }, show: { opacity: 1, scale: 1, transition: ease } };

const stagger = (delay = 0) => ({ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { ...ease, delay } } });

// ── Hero variants ──────────────────────────────────────────────────────────

const heroContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.12 } } };
const heroItem      = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

// ──────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const [openDemo, setOpenDemo] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const whatRef    = useRef<HTMLDivElement | null>(null);
  const whyRef     = useRef<HTMLDivElement | null>(null);
  const serviceRef = useRef<HTMLDivElement | null>(null);
  const tourRef    = useRef<HTMLDivElement | null>(null);
  const priceRef   = useRef<HTMLDivElement | null>(null);
  const aboutRef   = useRef<HTMLDivElement | null>(null);

  const scrollTo = (ref: any) => ref.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className="bg-[#f7f8fc] text-gray-900 relative overflow-hidden">

      {/* BACKGROUND BLOBS */}
      <motion.div animate={{ y: [0, -20, 0], x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 12 }}
        className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-[#6B4EFF]/20 blur-[140px] rounded-full pointer-events-none" />
      <motion.div animate={{ y: [0, 20, 0], x: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 15 }}
        className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-indigo-200/30 blur-[140px] rounded-full pointer-events-none" />

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 w-full bg-white/60 backdrop-blur border-b z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/logo1.svg" alt="SOB System Logo" className="w-8 h-8 object-contain" />
            <h1 className="hidden sm:block font-semibold text-lg">
              <span className="text-[#6B4EFF]">SOB System</span>
            </h1>
          </div>

          <nav className="hidden md:flex gap-6 text-sm text-gray-600">
            <button onClick={() => scrollTo(whatRef)}>СӨБ гэж юу вэ?</button>
            <button onClick={() => scrollTo(whyRef)}>Яагаад СӨБ?</button>
            <button onClick={() => scrollTo(serviceRef)}>Үйлчилгээ</button>
            <button onClick={() => scrollTo(tourRef)}>Заавар</button>
            <button onClick={() => scrollTo(priceRef)}>Үнэ</button>
            <button onClick={() => scrollTo(aboutRef)}>Бидний тухай</button>
          </nav>

          <div className="flex items-center gap-3">
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>☰</button>
            <button onClick={() => setOpenDemo(true)} className="px-4 py-2 border rounded-xl text-sm hover:bg-gray-100 hidden sm:block">
              Туршиж үзэх
            </button>
            <button onClick={() => router.push("/login")} className="px-4 py-2 bg-[#6B4EFF] text-white rounded-xl text-sm">
              Нэвтрэх
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t px-6 py-4 space-y-3 text-sm text-gray-700 flex flex-col">
            {[
              ["СӨБ гэж юу вэ?", whatRef], ["Яагаад СӨБ?", whyRef],
              ["Үйлчилгээ", serviceRef], ["Заавар", tourRef],
              ["Үнэ", priceRef], ["Бидний тухай", aboutRef],
            ].map(([label, ref]) => (
              <button key={label as string} onClick={() => { scrollTo(ref); setMobileMenuOpen(false); }}>
                {label as string}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-12 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <motion.div initial="hidden" animate="show" variants={heroContainer}>
          <motion.h1 variants={heroItem} className="text-5xl font-semibold">
            Ухаалаг <span className="text-[#6B4EFF]">цэцэрлэгийн систем</span>
          </motion.h1>
          <motion.p variants={heroItem} className="mt-6 text-gray-600 text-lg">
            QR ирц, харилцаа, төлбөр, тайлан — бүгд нэг системд.
          </motion.p>
          <motion.div variants={heroItem} className="mt-8 flex gap-4">
            <button onClick={() => setOpenDemo(true)} className="px-6 py-3 bg-[#6B4EFF] text-white rounded-xl">
              Туршиж үзэх
            </button>
            <button onClick={() => router.push("/login")} className="px-6 py-3 border rounded-xl">
              Нэвтрэх
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          className="h-[400px] md:h-[700px] flex items-center justify-center px-4"
          initial={{ opacity: 0, scale: 0.88, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.img
            src="/admin-main-mockups.png"
            alt="App Preview"
            className="h-full w-auto object-cover drop-shadow-2xl"
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          />
        </motion.div>
      </section>

      {/* ── СӨБ ГЭЖ ЮУ ВЭ? ────────────────────────────────────────────── */}
      <section ref={whatRef} className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">

          <motion.div className="text-center"
            variants={fromBottom} initial="hidden" whileInView="show" viewport={vp}>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              <span className="text-[#6B4EFF]">СӨБ систем</span> гэж юу вэ?
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
              Багш, Удирдлага, Эцэг эхийг нэг системд холбосон сургуулийн өмнөх боловсролын байгууллагын нэгдсэн мэдээллийн систем.
            </p>
          </motion.div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* LEFT — cards from left */}
            <motion.div className="space-y-6"
              variants={fromLeft} initial="hidden" whileInView="show" viewport={vp}>
              {[
                { icon: "📱", title: "QR ирц", desc: "Эцэг эхчүүд хүүхдүүдээ QR код ашиглан ирцийг бүртгэнэ. Гараар бичиг цаас гэх шаардлагагүй." },
                { icon: "💬", title: "Эцэг эхийн харилцаа холбоо", desc: "Багш нар болон эцэг эхчүүд хүүхдийн өдөр тутмын үйл ажиллагаа, хөгжил, мэдээ мэдээллийг шуурхай хуваалцаж, харилцан яриа өрнүүлэх боломжтой." },
                { icon: "💳", title: "Төлбөрийн ухаалаг шийдэл", desc: "Хүүхэд бүрийн сарын төлбөрийг тодорхой төлсөн/төлөөгүй статусын хамт хянах боломжтой." },
              ].map((card, i) => (
                <motion.div key={i}
                  variants={stagger(i * 0.1)} initial="hidden" whileInView="show" viewport={vp}
                  className="p-6 rounded-2xl border bg-gray-50 hover:bg-white hover:shadow-md transition duration-300 cursor-default">
                  <h3 className="font-semibold text-lg">{card.icon} {card.title}</h3>
                  <p className="text-sm text-gray-600 mt-2">{card.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* RIGHT — image from right */}
            <motion.div className="relative"
              variants={fromRight} initial="hidden" whileInView="show" viewport={vp}>
              <div className="h-[300px] md:h-[420px] rounded-3xl border bg-gradient-to-br from-[#6B4EFF]/10 via-white to-indigo-100 flex items-center justify-center shadow-sm overflow-hidden">
                <img src="/admin-main.png" alt="System preview" className="w-full h-full object-contain p-6" />
              </div>
              <motion.div
                className="absolute -bottom-4 left-4 bg-white border shadow-sm rounded-xl px-4 py-2 text-xs text-gray-600"
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={vp}
                transition={{ delay: 0.4, duration: 0.5 }}>
                🚀 Бүгдийг нэг дороос
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── ЯАГААД БИДНИЙГ СОНГОХ ВЭ? ─────────────────────────────────── */}
      <section ref={whyRef} className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">

          <motion.div className="text-center"
            variants={fromBottom} initial="hidden" whileInView="show" viewport={vp}>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Яагаад <span className="text-[#6B4EFF]">биднийг сонгох вэ?</span>
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
              Бид цэцэрлэгийн үйл ажиллагааг автоматжуулж, ил тод, хялбар, ухаалаг систем болгон нэгтгэсэн.
            </p>
          </motion.div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "⚡", title: "Хурдан бөгөөд хялбар", desc: "Бүх үйлдэл маш хурдан, энгийн алхмуудаар хийгдэнэ." },
              { icon: "🔒", title: "Аюулгүй байдал", desc: "Хүүхэд болон эцэг эхийн мэдээлэл бүрэн хамгаалагдсан." },
              { icon: "📊", title: "Ухаалаг тайлан", desc: "Ирц, төлбөр, хөгжил гээд бүх мэдээллийг бодит цагт харна." },
              { icon: "💬", title: "Эцэг эхийн харилцаа", desc: "Багш болон эцэг эх шууд, хурдан холбогдоно." },
              { icon: "💳", title: "Төлбөрийн хяналт", desc: "Хүүхэд бүрийн төлбөрийг тодорхой, ойлгомжтой хянах боломжтой." },
              { icon: "🚀", title: "Өргөтгөх боломжтой", desc: "Жижигээс том байгууллага хүртэл тохиромжтой систем." },
            ].map((card, i) => (
              <motion.div key={i}
                variants={stagger(i * 0.08)} initial="hidden" whileInView="show" viewport={vp}
                whileHover={{ y: -6, scale: 1.02 }}
                className="p-6 bg-white rounded-2xl border shadow-sm hover:shadow-lg transition duration-300 cursor-default">
                <div className="text-3xl">{card.icon}</div>
                <h3 className="mt-4 font-semibold text-lg">{card.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ҮЙЛЧИЛГЭЭ ──────────────────────────────────────────────────── */}
      <section ref={serviceRef} className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">

          <motion.div className="text-center mb-14"
            variants={fromBottom} initial="hidden" whileInView="show" viewport={vp}>
            <h2 className="text-3xl md:text-4xl font-semibold">
              Үндсэн <span className="text-[#6B4EFF]">үйлчилгээнүүд</span>
            </h2>
            <p className="mt-3 text-gray-600 text-sm md:text-base">
              Цэцэрлэгийн бүх үйл ажиллагааг нэг системд ухаалгаар удирдана.
            </p>
          </motion.div>

          <div className="space-y-20">
            {/* 1 — text left, image right */}
            <div className="flex flex-col md:flex-row items-center gap-10">
              <motion.div className="flex-1"
                variants={fromLeft} initial="hidden" whileInView="show" viewport={vp}>
                <h3 className="text-2xl font-semibold">📱 QR Ирцийн систем</h3>
                <p className="mt-3 text-gray-600">Хүүхдийн ирцийг QR кодоор хурдан, автомат бүртгэнэ.</p>
              </motion.div>
              <motion.div className="flex-1 h-[220px] md:h-[280px] rounded-3xl border overflow-hidden"
                variants={fromRight} initial="hidden" whileInView="show" viewport={vp}>
                <img src="/qr-attandance.png" alt="QR ирцийн систем" className="w-full h-full object-cover" />
              </motion.div>
            </div>

            {/* 2 — reversed */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-10">
              <motion.div className="flex-1"
                variants={fromRight} initial="hidden" whileInView="show" viewport={vp}>
                <h3 className="text-2xl font-semibold">💬 Эцэг эхийн харилцаа</h3>
                <p className="mt-3 text-gray-600">Багш болон эцэг эх хооронд шууд мэдээлэл солилцоно.</p>
              </motion.div>
              <motion.div className="flex-1 h-[220px] md:h-[280px] rounded-3xl border overflow-hidden"
                variants={fromLeft} initial="hidden" whileInView="show" viewport={vp}>
                <img src="/conversation-parent.png" alt="Эцэг эхийн харилцаа" className="w-full h-full object-cover" />
              </motion.div>
            </div>

            {/* 3 — text left, image right */}
            <div className="flex flex-col md:flex-row items-center gap-10">
              <motion.div className="flex-1"
                variants={fromLeft} initial="hidden" whileInView="show" viewport={vp}>
                <h3 className="text-2xl font-semibold">💳 Төлбөрийн удирдлага</h3>
                <p className="mt-3 text-gray-600">Хүүхэд бүрийн төлбөрийг тодорхой, ил тод хянах боломжтой.</p>
              </motion.div>
              <motion.div className="flex-1 h-[220px] md:h-[280px] rounded-3xl border overflow-hidden"
                variants={fromRight} initial="hidden" whileInView="show" viewport={vp}>
                <img src="/payment.png" alt="Төлбөрийн удирдлага" className="w-full h-full object-cover" />
              </motion.div>
            </div>

            {/* 4 — reversed */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-10">
              <motion.div className="flex-1"
                variants={fromRight} initial="hidden" whileInView="show" viewport={vp}>
                <h3 className="text-2xl font-semibold">📊 Тайлан, анализ</h3>
                <p className="mt-3 text-gray-600">Ирц, төлбөр, хөгжлийн ухаалаг тайлан харуулна.</p>
              </motion.div>
              <motion.div className="flex-1"
                variants={fromLeft} initial="hidden" whileInView="show" viewport={vp}>
                <img src="/report.png" alt="Тайлан, анализ" className="w-full h-full object-cover" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ЗААВАР / ВИДЕО ─────────────────────────────────────────────── */}
      <section ref={tourRef} className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">

          <motion.div className="text-center mb-14"
            variants={fromBottom} initial="hidden" whileInView="show" viewport={vp}>
            <h2 className="text-3xl md:text-4xl font-semibold">
              Бүтээгдэхүүний <span className="text-[#6B4EFF]">танилцуулга</span>
            </h2>
          </motion.div>

          <motion.div
            className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden border shadow-lg bg-black"
            variants={scaleIn} initial="hidden" whileInView="show" viewport={vp}>
            <video className="w-full h-[220px] md:h-[420px] object-cover" autoPlay muted loop playsInline>
              <source src="/Promo.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h3 className="text-lg md:text-2xl font-semibold">СӨБ систем</h3>
              <p className="text-xs md:text-sm opacity-80">Ирц • Харилцаа</p>
            </div>
            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-white text-xs">
              ▶ Заавар бичлэг
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── ҮНЭ ────────────────────────────────────────────────────────── */}
      <section ref={priceRef} className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">

          <motion.div className="text-center mb-14"
            variants={fromBottom} initial="hidden" whileInView="show" viewport={vp}>
            <h2 className="text-3xl md:text-4xl font-semibold">
              Үнийн <span className="text-[#6B4EFF]">багцууд</span>
            </h2>
            <p className="mt-3 text-gray-600 text-sm md:text-base">
              Сар, жил болон уян хатан багцаас сонгох боломжтой.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 text-pink-600 text-sm font-medium border border-pink-100">
              ❤️ Тусгай хэрэгцээт хүүхдүүдтэй цэцэрлэгүүдэд үнийн дүнгээс
              <span className="ml-1 px-2 py-1 rounded-full bg-pink-500 text-white text-xs font-semibold animate-pulse">
                90% ХӨНГӨЛӨЛТ
              </span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                delay: 0, highlight: false,
                title: "📅 Сарын багц", desc: "Сар бүр төлбөр төлөх уян хатан сонголт.",
                price: "499.999₮", priceLabel: null,
                features: ["QR Ирц", "Эцэг эхийн харилцаа", "Төлбөрийн систем", "Тайлан"],
                cta: null,
              },
              {
                delay: 0.1, highlight: true,
                title: "📆 Жилийн багц", desc: "12 сарын багц — илүү хямд, илүү тогтвортой.",
                price: "1.499.999₮", priceLabel: "Хэмнэлттэй",
                features: ["QR Ирц", "Эцэг эхийн харилцаа", "Төлбөрийн систем", "Тайлан", "Priority support"],
                cta: null,
              },
              {
                delay: 0.2, highlight: false,
                title: "💡 Уян хатан багц", desc: "Танай байгууллагын хэмжээ, хэрэглээнд тохируулж үнийн санал гаргана.",
                price: null, priceLabel: null,
                features: ["Модулийн тохиргоог өөрчлөх", "Холболт", "Байгууллагын онцлогууд", "Тусгай дэмжлэг"],
                cta: "Туршиж үзэх",
              },
            ].map((card, i) => (
              <motion.div key={i}
                variants={stagger(card.delay)} initial="hidden" whileInView="show" viewport={vp}
                whileHover={{ y: -6 }}
                className={`rounded-3xl border p-8 shadow-sm hover:shadow-xl transition relative ${
                  card.highlight ? "bg-gradient-to-br from-[#6B4EFF]/5 to-indigo-50 shadow-lg" : "bg-white"
                }`}>
                {card.priceLabel && (
                  <div className="absolute top-4 right-4 bg-[#6B4EFF] text-white text-xs px-3 py-1 rounded-full">
                    {card.priceLabel}
                  </div>
                )}
                <h3 className="text-xl font-semibold">{card.title}</h3>
                <p className="mt-2 text-gray-600 text-sm">{card.desc}</p>
                <div className="mt-6 text-3xl font-semibold text-[#6B4EFF]">
                  {card.price ?? <span className="text-lg text-gray-700">Бидэнтэй холбогдоорой</span>}
                </div>
                <ul className="mt-6 space-y-2 text-sm text-gray-600">
                  {card.features.map((f) => <li key={f}>✔ {f}</li>)}
                </ul>
                {card.cta && (
                  <button onClick={() => setOpenDemo(true)}
                    className="mt-6 w-full py-3 bg-[#6B4EFF] text-white rounded-xl hover:opacity-90 transition">
                    {card.cta}
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMING SOON ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">

          <motion.div className="text-center mb-16"
            variants={fromBottom} initial="hidden" whileInView="show" viewport={vp}>
            <h2 className="text-3xl md:text-4xl font-semibold">
              Удахгүй <span className="text-[#6B4EFF]">нэмэгдэх</span>
            </h2>
            <p className="mt-4 text-gray-600 text-sm md:text-base">
              Бид системээ илүү өргөжүүлж, дараах боломжуудыг нэмэхээр төлөвлөж байна.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              variants={fromLeft} initial="hidden" whileInView="show" viewport={vp}
              whileHover={{ y: -8, scale: 1.02 }}
              className="p-8 rounded-3xl border bg-white shadow-sm hover:shadow-xl transition relative overflow-hidden">
              <div className="absolute top-4 right-4 text-xs px-3 py-1 bg-[#6B4EFF]/10 text-[#6B4EFF] rounded-full">Coming Soon</div>
              <div className="text-3xl">📚</div>
              <h3 className="mt-4 text-xl font-semibold">SOB Learning</h3>
              <p className="mt-3 text-gray-600 text-sm">Хүүхэд болон багшийн хөгжлийг дэмжих сургалтын платформ.</p>
            </motion.div>

            <motion.div
              variants={fromRight} initial="hidden" whileInView="show" viewport={vp}
              whileHover={{ y: -8, scale: 1.02 }}
              className="p-8 rounded-3xl border bg-white shadow-sm hover:shadow-xl transition relative overflow-hidden">
              <div className="absolute top-4 right-4 text-xs px-3 py-1 bg-[#6B4EFF]/10 text-[#6B4EFF] rounded-full">Coming Soon</div>
              <div className="text-3xl">🎥</div>
              <h3 className="mt-4 text-xl font-semibold">SOB Content</h3>
              <p className="mt-3 text-gray-600 text-sm">Хүүхдүүд зориулсан сургалтын видео, материал, контентуудыг нэг дороос авах боломж.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── БИДНИЙ ТУХАЙ ───────────────────────────────────────────────── */}
      <section ref={aboutRef} className="bg-gray-50 py-24">
        <div className="max-w-5xl mx-auto px-6">

          <motion.div className="text-center mb-12"
            variants={fromBottom} initial="hidden" whileInView="show" viewport={vp}>
            <h2 className="text-3xl md:text-4xl font-semibold">
              Бидний <span className="text-[#6B4EFF]">тухай</span>
            </h2>
            <p className="mt-3 text-gray-600 text-sm md:text-base">
              Бидний хөгжүүлж буй энэхүү систем нь цэцэрлэгийн үйл ажиллагааг илүү ухаалаг, хялбар болгох зорилготой.
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-3xl border shadow-sm p-8 md:p-12 relative overflow-hidden"
            variants={scaleIn} initial="hidden" whileInView="show" viewport={vp}>
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#6B4EFF]/10 rounded-full blur-3xl" />
            <div className="relative">
              <motion.h3 className="text-xl md:text-2xl font-semibold"
                variants={fromLeft} initial="hidden" whileInView="show" viewport={vp}>
                👨‍💻 МУИС-ийн оюутан, Хөгжүүлэгч: Баттулга овогтой Мөрөн
              </motion.h3>
              <motion.p className="mt-4 text-gray-600 leading-relaxed text-sm md:text-base"
                variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={vp}>
                Би энэ системийг цэцэрлэгийн өдөр тутмын үйл ажиллагаанд тулгардаг асуудлуудыг шийдэх зорилгоор бие даан хөгжүүлж байна.
                QR ирц, эцэг эхийн харилцаа, төлбөрийн удирдлага болон тайлангийн системийг нэг дор нэгтгэж,
                илүү энгийн, хурдан, ухаалаг шийдэл бий болгохыг зорьсон.
              </motion.p>
              <motion.div className="mt-8 p-5 rounded-2xl bg-gray-50 border"
                variants={stagger(0.2)} initial="hidden" whileInView="show" viewport={vp}>
                <p className="text-sm text-gray-700">
                  💡 Миний зорилго бол зөвхөн програм хийх биш —
                  <span className="font-semibold text-[#6B4EFF]"> бодит асуудлыг шийдсэн бүтээгдэхүүн бүтээх </span>юм.
                </p>
              </motion.div>
              <div className="mt-10 flex items-center justify-between text-sm text-gray-500 flex-col sm:flex-row gap-2">
                <span>🚀 Сургуулийн өмнөх боловсролын байгууллагын нэгдсэн мэдээллийн систем</span>
                <span>2026</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── MODAL ──────────────────────────────────────────────────────── */}
      {openDemo && <DemoForm onClose={() => setOpenDemo(false)} />}
 
      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

            <div>
              <div className="flex items-center gap-2">
                <img src="/logo1.svg" alt="SOB System Logo" className="w-8 h-8 object-contain" />
                <h3 className="text-lg font-semibold text-[#6B4EFF]">SOB System</h3>
              </div>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                Сургуулийн өмнөх боловсролын байгууллагын нэгдсэн мэдээллийн систем.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Холбоосууд</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><button className="hover:text-[#6B4EFF]" onClick={() => scrollTo(whatRef)}>СӨБ гэж юу вэ?</button></li>
                <li><button className="hover:text-[#6B4EFF]" onClick={() => scrollTo(whyRef)}>Яагаад СӨБ?</button></li>
                <li><button className="hover:text-[#6B4EFF]" onClick={() => scrollTo(serviceRef)}>Үйлчилгээ</button></li>
                <li><button className="hover:text-[#6B4EFF]" onClick={() => scrollTo(priceRef)}>Үнэ</button></li>
                <li><button className="hover:text-[#6B4EFF]" onClick={() => scrollTo(aboutRef)}>Бидний тухай</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Эхлэх</h4>
              <div className="flex flex-col gap-3">
                <button onClick={() => setOpenDemo(true)} className="px-4 py-2 rounded-xl bg-[#6B4EFF] text-white text-sm hover:opacity-90">
                  Туршиж үзэх
                </button>
                <button onClick={() => router.push("/login")} className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-50">
                  Нэвтрэх
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Холбоо барих</h4>
              <div className="flex gap-3 text-gray-600">
                <a href="https://www.facebook.com/nuuz.az" target="_blank" className="hover:text-[#6B4EFF]">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12a10 10 0 10-11.5 9.9v-7H8v-3h2.5V9.5C10.5 7 12 5.5 14.2 5.5c1 0 2 .2 2 .2v2.2h-1.2c-1.2 0-1.6.8-1.6 1.6V12H18l-.5 3h-2.4v7A10 10 0 0022 12z"/></svg>
                </a>
                <a href="https://www.instagram.com/murunation/" target="_blank" className="hover:text-[#6B4EFF]">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm10 2H7a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3zm-5 4a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6zm5.5-3a1 1 0 110 2 1 1 0 010-2z"/></svg>
                </a>
                <a href="https://www.linkedin.com/in/murun-battulga-752673305/" target="_blank" className="hover:text-[#6B4EFF]">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.95v5.66H9.37V9h3.41v1.56h.05c.48-.9 1.65-1.85 3.4-1.85 3.64 0 4.32 2.4 4.32 5.51v6.23zM5.34 7.43a2.07 2.07 0 11.01-4.14 2.07 2.07 0 01-.01 4.14zM6.9 20.45H3.78V9h3.12v11.45z"/></svg>
                </a>
                <a href="mailto:murunbattulga6@gmail.com" target="_blank" className="hover:text-[#6B4EFF]">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t text-center text-xs text-gray-500">
            © 2026 СӨБ систем — Бүх эрх хуулиар хамгаалагдсан
          </div>
        </div>
      </footer>
    </main>
  );
}
