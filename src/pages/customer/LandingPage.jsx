import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Heart, Info, Sparkles, QrCode, CheckCircle2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore, useAuthStore } from '../../store';
import api from '../../api';

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setTable, tableNumber } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const [manualTable, setManualTable] = useState('');
  const [tableVerified, setTableVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);

  // Auto-detect table from QR code URL parameter (?table=N)
  useEffect(() => {
    const qrTable = searchParams.get('table');
    if (qrTable) {
      verifyTable(parseInt(qrTable));
    } else if (tableNumber) {
      setTableVerified(true);
    }
  }, [searchParams]);

  const verifyTable = async (num) => {
    if (!num || isNaN(num) || num < 1) {
      toast.error('Invalid table number');
      return;
    }
    setVerifying(true);
    try {
      const { data } = await api.get(`/tables/scan/${num}`);
      if (data.table) {
        setTable(num);
        setTableVerified(true);
        toast.success(`Welcome to Table ${num}!`);
      }
    } catch {
      // Table might not exist yet, still set it (backend creates on order)
      setTable(num);
      setTableVerified(true);
      toast.success(`Seated at Table ${num}`);
    } finally {
      setVerifying(false);
    }
  };

  const handleManualEntry = (e) => {
    e.preventDefault();
    const num = parseInt(manualTable);
    if (num > 0 && num <= 50) {
      verifyTable(num);
      setShowManualEntry(false);
    } else {
      toast.error('Please enter a valid table number (1-50)');
    }
  };

  const handleBrowseMenu = () => {
    if (!tableVerified) {
      toast.error('Please scan a QR code or enter your table number first');
      setShowManualEntry(true);
      return;
    }
    navigate('/menu');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 px-6 flex flex-col justify-center items-center text-center pt-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="w-24 h-24 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Menu size={48} className="text-orange-600" />
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2 leading-tight">VibeDine</h2>
          <p className="text-gray-500 text-lg">Delicious food tailored to your well-being.</p>
        </motion.div>

        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-4 bg-orange-50 rounded-2xl"
          >
            <p className="text-orange-700 font-medium">Welcome back, {user?.name}!</p>
          </motion.div>
        )}

        {/* Table Status Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`w-full max-w-sm mb-6 p-4 rounded-2xl border-2 transition-all ${
            tableVerified
              ? 'border-green-200 bg-green-50'
              : 'border-orange-200 bg-orange-50'
          }`}
        >
          {verifying ? (
            <div className="flex items-center justify-center gap-2 text-orange-600">
              <div className="w-5 h-5 border-2 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
              <span className="font-medium">Verifying table...</span>
            </div>
          ) : tableVerified ? (
            <div className="flex items-center justify-center gap-2 text-green-700">
              <CheckCircle2 size={20} />
              <span className="font-bold">Table {tableNumber}</span>
              <span className="text-green-600 text-sm">— Ready to order</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-orange-700">
                <QrCode size={20} />
                <span className="font-bold text-sm">Scan the QR code on your table</span>
              </div>
              <button
                onClick={() => setShowManualEntry(!showManualEntry)}
                className="text-xs text-orange-500 underline underline-offset-2"
              >
                Or enter table number manually
              </button>
            </div>
          )}
        </motion.div>

        {/* Manual Table Entry */}
        <AnimatePresence>
          {showManualEntry && !tableVerified && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleManualEntry}
              className="w-full max-w-sm mb-6 overflow-hidden"
            >
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={manualTable}
                    onChange={(e) => setManualTable(e.target.value)}
                    placeholder="Table number"
                    className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-200"
                >
                  Go
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="w-full space-y-4 max-w-sm">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleBrowseMenu}
            className={`w-full py-4 rounded-2xl font-semibold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
              tableVerified
                ? 'bg-orange-600 text-white shadow-orange-200'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            <Menu size={20} />
            Browse Menu
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/health-profile')}
            className="w-full bg-white text-orange-600 border-2 border-orange-100 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2"
          >
            <Heart size={20} />
            {isAuthenticated ? 'Update Health Profile' : 'Create Health Profile'}
          </motion.button>

          {isAuthenticated && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/recommendations')}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
            >
              <Sparkles size={20} />
              AI Picks For You
            </motion.button>
          )}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 p-6 bg-green-50 rounded-3xl border border-green-100 text-left max-w-sm"
        >
          <h3 className="text-green-800 font-bold mb-2 flex items-center gap-2">
            <Info size={18} />
            Why create a profile?
          </h3>
          <ul className="text-green-700 text-sm space-y-2">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
              Automatic allergy detection & safety alerts
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
              Personalized meal recommendations
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
              Track nutritional goals in real-time
            </li>
          </ul>
        </motion.div>

        <div className="mt-8 mb-8 space-y-2">
          {!isAuthenticated ? (
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <button onClick={() => navigate('/login')} className="text-orange-600 font-medium">
                Login
              </button>
            </p>
          ) : (
            <p className="text-gray-400 text-sm">
              <button onClick={() => navigate('/admin/login')} className="text-orange-600 font-medium">
                Staff Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
