import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TableProperties, Plus, Trash2, Users, MapPin,
  CheckCircle2, XCircle, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';

const statusColors = {
  available: 'bg-green-100 text-green-700',
  occupied: 'bg-red-100 text-red-700',
  reserved: 'bg-amber-100 text-amber-700',
};

const locationOptions = ['indoor', 'outdoor', 'private', 'bar'];

export default function AdminTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ tableNumber: '', capacity: 4, location: 'indoor' });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/tables');
      setTables(data);
    } catch (err) {
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.tableNumber || isNaN(form.tableNumber) || parseInt(form.tableNumber) <= 0) {
      setFormError('Please enter a valid table number');
      return;
    }
    setSaving(true);
    try {
      await api.post('/tables', {
        tableNumber: parseInt(form.tableNumber),
        capacity: parseInt(form.capacity) || 4,
        location: form.location,
      });
      toast.success(`Table ${form.tableNumber} added`);
      setShowModal(false);
      setForm({ tableNumber: '', capacity: 4, location: 'indoor' });
      fetchTables();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add table');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (tableId, newStatus) => {
    try {
      await api.patch(`/tables/${tableId}/status`, { status: newStatus });
      setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: newStatus } : t));
      toast.success(`Table status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update table status');
    }
  };

  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
  };

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Table Management</h1>
          <p className="text-sm text-gray-500">Define and manage restaurant tables</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTables}
            className="p-2.5 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-xl transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => { setShowModal(true); setFormError(''); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Add Table
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Tables', value: stats.total, color: 'bg-blue-50 text-blue-600' },
            { label: 'Available', value: stats.available, color: 'bg-green-50 text-green-600' },
            { label: 'Occupied', value: stats.occupied, color: 'bg-red-50 text-red-600' },
            { label: 'Reserved', value: stats.reserved, color: 'bg-amber-50 text-amber-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
              <p className={`text-3xl font-extrabold ${color.split(' ')[1]}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Table Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-2xl h-40 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : tables.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TableProperties size={28} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">No tables yet</h3>
            <p className="text-gray-400 text-sm mb-4">Click "Add Table" to define your first table</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-primary-500 text-white rounded-xl font-medium text-sm"
            >
              Add First Table
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tables
              .sort((a, b) => (a.tableNumber || a.table_number) - (b.tableNumber || b.table_number))
              .map(table => {
                const num = table.tableNumber || table.table_number;
                const cap = table.capacity;
                const loc = table.location;
                const status = table.status || 'available';
                return (
                  <motion.div
                    key={table.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Table</p>
                        <p className="text-3xl font-extrabold text-gray-900">{num}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${statusColors[status] || 'bg-gray-100 text-gray-600'}`}>
                        {status}
                      </span>
                    </div>

                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Users size={12} />
                        <span>Seats {cap}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <MapPin size={12} />
                        <span className="capitalize">{loc}</span>
                      </div>
                    </div>

                    {/* Status controls */}
                    <div className="grid grid-cols-3 gap-1">
                      {['available', 'occupied', 'reserved'].map(s => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(table.id, s)}
                          className={`text-[10px] py-1.5 rounded-lg font-semibold transition-all ${
                            status === s
                              ? statusColors[s] + ' font-bold'
                              : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
          </div>
        )}
      </div>

      {/* Add Table Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-3xl p-6 w-full max-w-sm mx-4 shadow-2xl"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-1">Add New Table</h2>
              <p className="text-sm text-gray-500 mb-5">Define a new table for your restaurant</p>

              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                    Table Number *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.tableNumber}
                    onChange={e => setForm({ ...form, tableNumber: e.target.value })}
                    placeholder="e.g. 11"
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                    Capacity (seats)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={form.capacity}
                    onChange={e => setForm({ ...form, capacity: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                    Location
                  </label>
                  <select
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {locationOptions.map(l => (
                      <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                    ))}
                  </select>
                </div>

                {formError && (
                  <p className="text-xs text-red-600 bg-red-50 rounded-xl p-3">{formError}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 bg-primary-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-primary-600 transition-colors"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus size={16} />
                        Add Table
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
