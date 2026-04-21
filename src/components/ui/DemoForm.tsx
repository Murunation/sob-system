"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { saveDemoRequest } from "@/app/actions/demo-request";

const steps = ["role", "students", "locations", "started", "contact"];

export default function DemoForm({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [data, setData] = useState({
    role: "",
    students: "",
    locations: "",
    started: "",
    name: "",
    email: "",
    phone: "",
  });

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const update = (key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));

    setTimeout(() => {
      if (step < steps.length - 1) next();
    }, 180);
  };

  const submit = async () => {
    try {
      await saveDemoRequest(data);
      setSubmitted(true);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
        >
          ✕
        </button>

        {/* PROGRESS BAR */}
        {!submitted && (
          <div className="mb-6">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#6B4EFF] transition-all duration-300"
                style={{
                  width: `${((step + 1) / steps.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ================= SUCCESS ================= */}
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <div className="text-6xl mb-4">🎉</div>

              <h2 className="text-2xl font-semibold text-[#6B4EFF]">
                Амжилттай илгээгдлээ
              </h2>

              <p className="text-gray-500 mt-2">
                Бид таны хүсэлтийг хүлээн авлаа.
                Удахгүй холбогдох болно.
              </p>

              <button
                onClick={onClose}
                className="mt-6 px-6 py-3 bg-[#6B4EFF] text-white rounded-xl hover:scale-105 transition"
              >
                Хаах
              </button>
            </motion.div>
          ) : (
            <>
              {/* STEP 1 */}
              {step === 0 && (
                <motion.div key="role" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-semibold mb-4">
                    Та ямар role вэ?
                  </h2>

                  <div className="grid grid-cols-2 gap-3">
                    {["Эрхлэгч", "Захирал", "Багш", "Эцэг эх"].map((r) => (
                      <button
                        key={r}
                        onClick={() => update("role", r)}
                        className="p-4 border rounded-xl hover:border-[#6B4EFF] hover:scale-[1.02] transition"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 2 */}
              {step === 1 && (
                <motion.div key="students">
                  <h2 className="text-xl font-semibold mb-4">
                    Хүүхдийн тоо?
                  </h2>

                  <div className="grid grid-cols-2 gap-3">
                    {["1-50", "50-100", "100-300", "300+"].map((v) => (
                      <button
                        key={v}
                        onClick={() => update("students", v)}
                        className="p-4 border rounded-xl hover:border-[#6B4EFF]"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 3 */}
              {step === 2 && (
                <motion.div key="locations">
                  <h2 className="text-xl font-semibold mb-4">
                    Хэдэн салбартай вэ?
                  </h2>

                  <div className="grid grid-cols-2 gap-3">
                    {["1", "2-3", "3-5", "5+"].map((v) => (
                      <button
                        key={v}
                        onClick={() => update("locations", v)}
                        className="p-4 border rounded-xl hover:border-[#6B4EFF]"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 4 */}
              {step === 3 && (
                <motion.div key="started">
                  <h2 className="text-xl font-semibold mb-4">
                    Та үйл ажиллагаагаа эхэлсэн үү?
                  </h2>

                  <div className="grid grid-cols-2 gap-3">
                    {["Тийм", "Үгүй"].map((v) => (
                      <button
                        key={v}
                        onClick={() => update("started", v)}
                        className="p-4 border rounded-xl hover:border-[#6B4EFF]"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 5 */}
              {step === 4 && (
                <motion.div key="contact">
                  <h2 className="text-xl font-semibold mb-4">
                    Холбоо барих мэдээлэл
                  </h2>

                  <input
                    className="w-full p-3 border rounded-xl mb-3"
                    placeholder="Нэр"
                    onChange={(e) =>
                      setData({ ...data, name: e.target.value })
                    }
                  />

                  <input
                    className="w-full p-3 border rounded-xl mb-3"
                    placeholder="Email"
                    onChange={(e) =>
                      setData({ ...data, email: e.target.value })
                    }
                  />

                  <input
                    className="w-full p-3 border rounded-xl mb-4"
                    placeholder="Утас"
                    onChange={(e) =>
                      setData({ ...data, phone: e.target.value })
                    }
                  />

                  <button
                    onClick={submit}
                    className="w-full bg-[#6B4EFF] text-white p-3 rounded-xl hover:scale-[1.02] transition"
                  >
                    Илгээх
                  </button>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>

        {/* NAV */}
        {!submitted && (
          <div className="flex justify-between mt-6">
            <button onClick={back} className="text-sm text-gray-500">
              Back
            </button>

            <span className="text-xs text-gray-400">
              Step {step + 1}/{steps.length}
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}