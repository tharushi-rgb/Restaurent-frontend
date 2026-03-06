import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Plus, User, Mail, Phone, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';

export default function AdminStaff() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [performance, setPerformance] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [staffRes, perfRes] = await Promise.all([
        api.get('/admin/staff'),
        api.get('/admin/staff-performance')
      ]);
      setStaff(staffRes.data.staff);
      setPerformance(perfRes.data.performance);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceForStaff = (staffId) => {
    return performance.find(p => p.staffId === staffId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* Page Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-500">Manage your team members</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add Staff
        </button>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {staff.map((member) => {
              const perf = getPerformanceForStaff(member._id);
              
              return (
                <motion.div
                  key={member._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Avatar + Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="text-gray-400" size={24} />
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      member.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Name + Role */}
                  <h3 className="font-bold text-gray-900 text-sm truncate">{member.name}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 capitalize">
                    <Shield size={12} />
                    {member.role?.replace('_', ' ')}
                  </p>

                  {/* Contact */}
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-gray-400 flex items-center gap-2 truncate">
                      <Mail size={12} className="flex-shrink-0" />
                      {member.email}
                    </p>
                    {member.phone && (
                      <p className="text-xs text-gray-400 flex items-center gap-2">
                        <Phone size={12} className="flex-shrink-0" />
                        {member.phone}
                      </p>
                    )}
                  </div>

                  {/* Today's Performance */}
                  {perf && (
                    <div className="mt-3 p-2.5 bg-gray-50 rounded-xl">
                      <p className="text-[10px] font-bold text-gray-500 mb-1.5">Today's Performance</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-base font-bold text-gray-900">{perf.ordersHandled}</p>
                          <p className="text-[10px] text-gray-400">Orders</p>
                        </div>
                        <div>
                          <p className="text-base font-bold text-gray-900">{perf.avgPrepTime || 'N/A'} min</p>
                          <p className="text-[10px] text-gray-400">Avg prep</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <AddStaffModal
          onClose={() => setShowModal(false)}
          onSave={async (data) => {
            try {
              await api.post('/admin/staff', data);
              toast.success('Staff member added');
              fetchData();
              setShowModal(false);
            } catch (error) {
              toast.error(error.response?.data?.message || 'Failed to add staff');
            }
          }}
        />
      )}
    </div>
  );
}

function AddStaffModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'kitchen_staff'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill all required fields');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full"
      >
        <h2 className="text-xl font-bold mb-4">Add Staff Member</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Password *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl"
            >
              <option value="kitchen_staff">Kitchen Staff</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-semibold"
            >
              Add Staff
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
