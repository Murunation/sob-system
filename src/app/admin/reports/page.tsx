'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/ui/DashboardLayout';
import { getAdminReports, confirmReport, returnReport } from '@/app/actions/admin';

type Report = {
  id: number;
  type: string;
  dateRange: string;
  status: string;
  filePath: string | null;
  createdAt: string;
};

const statusLabel: Record<string, string> = {
  SENT: 'Илгээсэн',
  CONFIRMED: 'Баталгаажсан',
  RETURNED: 'Буцаасан',
};

const statusColor: Record<string, string> = {
  SENT: 'bg-blue-100 text-blue-600',
  CONFIRMED: 'bg-green-100 text-green-600',
  RETURNED: 'bg-red-100 text-red-600',
};

const navItems = [
  { href: '/admin', label: 'Нүүр', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { href: '/admin/students', label: 'Хүүхдийн бүртгэл', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
  { href: '/admin/teachers', label: 'Багшийн бүртгэл', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { href: '/admin/groups', label: 'Бүлгийн удирдлага', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> },
  { href: '/admin/reports', label: 'Тайлан', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg> },
  { href: '/admin/feedback', label: 'Санал хүсэлт', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { href: '/admin/chefs', label: 'Тогоочийн бүртгэл', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg> },
  { href: '/admin/payments', label: 'Төлбөр', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
  { href: '/admin/attendance', label: 'Ирцийн засвар', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
  { href: '/admin/users', label: 'Хэрэглэгч', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg> },
  { href: '/admin/archive', label: 'Архив', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg> },
]

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  // MODAL STATE
  const [modal, setModal] = useState<null | { type: 'CONFIRM' | 'RETURN'; id: number }>(null);

  async function loadData() {
    const r = await getAdminReports();
    setReports(r as any);
  }

  useEffect(() => {
    loadData();
  }, []);

  const sent = reports.filter((r) => r.status === 'SENT');
  const others = reports.filter((r) => r.status !== 'SENT');

  return (
    <DashboardLayout navItems={navItems} role="Эрхлэгч">
      {/* ================= SENT ================= */}
      {sent.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">
            Хүлээгдэж буй
          </h2>

          <div className="space-y-3">
            {sent.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-purple-400"
              >
                <div className="flex justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{r.type}</h3>
                    <p className="text-sm text-gray-400">{r.dateRange}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString('mn-MN')}
                    </span>
                    {r.filePath && (
                      <a
                        href={`/api/reports/download?id=${r.id}`}
                        download
                        className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition flex items-center gap-1"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Excel татах
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setModal({ type: 'CONFIRM', id: r.id })}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-1.5 rounded-xl text-xs hover:bg-green-700"
                  >
                    ✓ Батлах
                  </button>

                  <button
                    onClick={() => setModal({ type: 'RETURN', id: r.id })}
                    disabled={loading}
                    className="flex-1 bg-red-500 text-white py-1.5 rounded-xl text-xs hover:bg-red-600"
                  >
                    ✗ Буцаах
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= ALL REPORTS ================= */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">
          Бүх тайлан
        </h2>

        <div className="space-y-3">
          {others.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">{r.type}</h3>
                  <p className="text-sm text-gray-400">{r.dateRange}</p>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${statusColor[r.status]}`}
                  >
                    {statusLabel[r.status]}
                  </span>

                  <div className="text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString('mn-MN')}
                  </div>

                  {r.filePath && (
                    <a
                      href={`/api/reports/download?id=${r.id}`}
                      download
                      className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition flex items-center gap-1"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Excel татах
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

          {others.length === 0 && sent.length === 0 && (
            <div className="bg-white rounded-2xl p-10 text-center text-gray-300">
              Тайлан байхгүй байна
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm shadow-xl">

            <h2 className="text-lg font-semibold text-gray-900">
              {modal.type === 'CONFIRM'
                ? 'Тайланг баталгаажуулах уу?'
                : 'Тайланг буцаах уу?'}
            </h2>

            <div className="flex gap-3 mt-6">

              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Үгүй
              </button>

              <button
                onClick={async () => {
                  if (!modal) return;

                  setLoading(true);

                  if (modal.type === 'CONFIRM') {
                    await confirmReport(modal.id);
                    toast.success('Тайлан баталгаажлаа');
                  } else {
                    await returnReport(modal.id);
                    toast.success('Тайлан буцаагдлаа');
                  }

                  setModal(null);
                  await loadData();
                  setLoading(false);
                }}
                className={`flex-1 py-2 rounded-xl text-white ${
                  modal.type === 'CONFIRM'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                Тийм
              </button>

            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}