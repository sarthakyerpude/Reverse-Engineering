import React, { useState, useEffect } from 'react';
import { CalendarCheck, Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const PlanningPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [sku, setSku] = useState('');
  const [targetPrice, setTargetPrice] = useState(1299);
  const [assignedTo, setAssignedTo] = useState('Operator 1');
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/planning', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku) return;
    setLoading(true);

    try {
      const res = await fetch('/api/planning/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          master_sku: sku,
          category: 'saree',
          target_price: targetPrice,
          assigned_to: assignedTo,
          target_date: new Date().toISOString().slice(0, 10)
        })
      });

      if (res.ok) {
        setSku('');
        await fetchTasks();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Add Task Form */}
      <div className="bg-white border border-[#dfe7e0] rounded-xl p-6 shadow-xs">
        <h2 className="text-lg font-bold text-[#163f34]">Listing Planning & Daily Work Tracker</h2>
        <p className="text-xs text-gray-500 mt-1">
          Assign SKU cataloging assignments to operators and track execution across marketplaces.
        </p>

        <form onSubmit={handleCreate} className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Target SKU</label>
            <input
              type="text"
              required
              placeholder="e.g. INFY-SKU-9920"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Target Price (₹)</label>
            <input
              type="number"
              required
              value={targetPrice}
              onChange={(e) => setTargetPrice(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Assign Operator</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
            >
              <option value="Operator 1">Operator 1 (Pooja Sharma)</option>
              <option value="Operator 2">Operator 2 (Rahul Verma)</option>
              <option value="Catalog Lead">Catalog Lead (Demo Admin)</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#245d43] hover:bg-[#1a4a35] text-white text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Task</span>
          </button>
        </form>
      </div>

      {/* Task List Table */}
      <div className="bg-white border border-[#dfe7e0] rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 font-bold text-xs text-[#163f34] uppercase tracking-wider">
          Active Team Assignments
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#f9fbf9] border-b border-gray-200 text-[#55695d]">
                <th className="py-3 px-4 font-semibold">SKU</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Target Price</th>
                <th className="py-3 px-4 font-semibold">Assigned To</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400">
                    No active assignments. Create one above.
                  </td>
                </tr>
              ) : (
                tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-gray-800">{t.master_sku}</td>
                    <td className="py-3 px-4 capitalize">{t.category}</td>
                    <td className="py-3 px-4 font-semibold">₹{t.target_price}</td>
                    <td className="py-3 px-4 text-gray-700">{t.assigned_to}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#edf5eb] text-[#3d8055] border border-[#d2e4cb]">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

