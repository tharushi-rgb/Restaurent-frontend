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
      <header className="bg-gray-900 text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="p-2 hover:bg-gray-800 rounded-lg">
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl font-bold">Staff Management</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="p-2 bg-orange-600 rounded-lg"
          >
            <Plus size={20} />
          </button>
        </div>
      </header>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {staff.map((member) => {
              const perf = getPerformanceForStaff(member._id);
              
              return (
                <motion.div
                  key={member._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl p-4 border border-gray-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="text-gray-400" size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-900">{member.name}</h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Shield size={14} />
                            {member.role?.replace('_', ' ')}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          member.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {member.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="mt-3 space-y-1">
                        <p className="text-xs text-gray-400 flex items-center gap-2">
                          <Mail size={12} />
                          {member.email}
                        </p>
                        {member.phone && (
                          <p className="text-xs text-gray-400 flex items-center gap-2">
                            <Phone size={12} />
                            {member.phone}
                          </p>
                        )}
                      </div>

                      {/* Today's Performance */}
                      {perf && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs font-bold text-gray-500 mb-2">Today's Performance</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-lg font-bold text-gray-900">{perf.ordersHandled}</p>
                              <p className="text-xs text-gray-400">Orders handled</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-gray-900">{perf.avgPrepTime || 'N/A'} min</p>
                              <p className="text-xs text-gray-400">Avg prep time</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
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
