import React, { useState, useEffect } from 'react';
import { Boxes, Save, RefreshCw, AlertTriangle, CheckCircle2, Plus } from 'lucide-react';

export const StockPage: React.FC = () => {
  const [stockList, setStockList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingSku, setEditingSku] = useState<string>('');
  const [newQuantity, setNewQuantity] = useState<number>(0);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  
  // Add SKU State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addSku, setAddSku] = useState<string>('');
  const [addQuantity, setAddQuantity] = useState<number>(100);

  const fetchStock = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stock', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStockList(data.stock || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleUpdate = async (sku: string) => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/stock/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ master_sku: sku, quantity: newQuantity })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStockList((prev) =>
          prev.map((item) => (item.master_sku === sku ? { ...item, stock_quantity: newQuantity } : item))
        );
        setMessage(`✓ Stock for ${sku} updated to ${newQuantity}`);
        setEditingSku('');
      } else {
        alert(data.error || 'Failed to update stock');
      }
    } catch (err: any) {
      alert('Error updating stock: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addSku) return;
    setSaving(true);
    try {
      const res = await fetch('/api/stock/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ master_sku: addSku.trim().toUpperCase(), quantity: addQuantity })
      });
      if (res.ok) {
        setAddSku('');
        setAddQuantity(100);
        setShowAddModal(false);
        await fetchStock();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white border border-[#dfe7e0] rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#163f34]">Shop Stock & Multi-Channel Inventory</h2>
          <p className="text-xs text-gray-500 mt-1">
            Synchronize Master SKU quantities across all 6 connected marketplaces to prevent out-of-stock cancellations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#143e32] hover:bg-[#1a4f40] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock Item</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-[#edf5eb] border border-[#d2e4cb] rounded-lg text-xs font-semibold text-[#3d8055] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddStock} className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-[#143e32]">Add Master SKU Inventory</h3>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Master SKU Code</label>
              <input
                type="text"
                required
                placeholder="e.g. INFY-SKU-1001"
                value={addSku}
                onChange={(e) => setAddSku(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg uppercase font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Initial Physical Stock (Units)</label>
              <input
                type="number"
                min="0"
                required
                value={addQuantity}
                onChange={(e) => setAddQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-bold"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-1.5 bg-[#143e32] text-white rounded-lg font-semibold"
              >
                Save Item
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-[#dfe7e0] rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 font-bold text-xs text-[#163f34] uppercase tracking-wider flex items-center justify-between">
          <span>Tracked Stock Items ({stockList.length})</span>
          <button onClick={fetchStock} className="text-gray-400 hover:text-[#143e32] cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#f9fbf9] border-b border-gray-200 text-[#55695d]">
                <th className="py-3 px-4 font-semibold">Master SKU</th>
                <th className="py-3 px-4 font-semibold">Stock Quantity</th>
                <th className="py-3 px-4 font-semibold">Reserved in Orders</th>
                <th className="py-3 px-4 font-semibold">Inventory Health</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stockList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No inventory records found. Click &quot;Add Stock Item&quot; above to add your first SKU.
                  </td>
                </tr>
              ) : (
                stockList.map((item) => {
                  const isEditing = editingSku === item.master_sku;
                  const isLow = item.stock_quantity < 15;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-gray-800">{item.master_sku}</td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={newQuantity}
                            onChange={(e) => setNewQuantity(Number(e.target.value))}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-xs"
                          />
                        ) : (
                          <span className="font-semibold text-gray-900">{item.stock_quantity} units</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-500">{item.reserved_quantity || 0} units</td>
                      <td className="py-3 px-4">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <AlertTriangle className="w-3 h-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Healthy
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleUpdate(item.master_sku)}
                              disabled={saving}
                              className="px-2.5 py-1 bg-[#245d43] text-white rounded text-xs font-semibold cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingSku('')}
                              className="px-2 py-1 text-gray-500 hover:text-gray-700 text-xs cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingSku(item.master_sku);
                              setNewQuantity(item.stock_quantity);
                            }}
                            className="text-[#245d43] hover:underline font-semibold cursor-pointer"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
