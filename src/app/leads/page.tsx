"use client";

import { useEffect, useState } from "react";
import { getDemoRequests } from "@/app/actions/demo-request";

const SECRET = "sob2026admin";

type Lead = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string | null;
  students: string | null;
  locations: string | null;
  started: string | null;
  createdAt: Date;
};

export default function LeadsPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);

  const login = () => {
    if (password === SECRET) {
      setAuthed(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  useEffect(() => {
    if (!authed) return;
    getDemoRequests()
      .then((data) => setLeads(data as Lead[]))
      .catch((e) => console.error("getDemoRequests error:", e));
  }, [authed]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#f7f8fc] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm">
          <h1 className="text-xl font-semibold mb-6 text-center text-[#6B4EFF]">
            Admin нэвтрэх
          </h1>
          <input
            type="password"
            className={`w-full border rounded-xl p-3 mb-4 outline-none focus:ring-2 focus:ring-[#6B4EFF] ${
              error ? "border-red-400" : ""
            }`}
            placeholder="Нууц үг"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
          />
          {error && (
            <p className="text-red-500 text-sm mb-3 text-center">
              Нууц үг буруу байна
            </p>
          )}
          <button
            onClick={login}
            className="w-full bg-[#6B4EFF] text-white py-3 rounded-xl hover:opacity-90 transition"
          >
            Нэвтрэх
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-[#6B4EFF]">
            Demo хүсэлтүүд
          </h1>
          <span className="text-sm text-gray-500">
            Нийт: {leads.length} хүсэлт
          </span>
        </div>

        {leads.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            Одоогоор хүсэлт ирээгүй байна
          </div>
        ) : (
          <div className="grid gap-4">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-gray-800">
                    {lead.name}
                  </span>
                  <span className="text-sm text-gray-500">{lead.email}</span>
                  <span className="text-sm text-gray-500">{lead.phone}</span>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {lead.role && (
                    <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full">
                      {lead.role}
                    </span>
                  )}
                  {lead.students && (
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                      {lead.students} хүүхэд
                    </span>
                  )}
                  {lead.locations && (
                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full">
                      {lead.locations} салбар
                    </span>
                  )}
                  {lead.started && (
                    <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full">
                      Эхэлсэн: {lead.started}
                    </span>
                  )}
                </div>

                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(lead.createdAt).toLocaleString("mn-MN")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
