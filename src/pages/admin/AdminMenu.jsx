import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';

export default function AdminMenu() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const { data } = await api.get('/menu');
      setItems(data.items);
    } catch (error) {
      console.error('Failed to fetch menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await api.patch(`/menu/${item._id}/availability`, {
        isAvailable: !item.isAvailable
      });
      setItems(items.map(i => 
        i._id === item._id ? { ...i, isAvailable: !i.isAvailable } : i
      ));
      toast.success(`${item.name} ${!item.isAvailable ? 'is now available' : 'marked as out of stock'}`);
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Are you sure you want to delete ${item.name}?`)) return;
    
    try {
      await api.delete(`/menu/${item._id}`);
      setItems(items.filter(i => i._id !== item._id));
      toast.success('Item deleted');
    } catch (error) {
      toast.error('Failed to delete item');
    }
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
            <h1 className="text-xl font-bold">Menu Management</h1>
          </div>
          <button
            onClick={() => {
              setEditItem(null);
              setShowModal(true);
            }}
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
          <div className="space-y-3">
            {items.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`bg-white rounded-2xl p-4 border ${
                  item.isAvailable ? 'border-gray-100' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.category}</p>
                      </div>
                      <span className="font-bold text-orange-600">${item.price?.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => toggleAvailability(item)}
                        className={`p-2 rounded-lg ${
                          item.isAvailable 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {item.isAvailable ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button
                        onClick={() => {
                          setEditItem(item);
                          setShowModal(true);
                        }}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                
                {!item.isAvailable && (
                  <div className="mt-3 px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-lg inline-block">
                    OUT OF STOCK
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit/Add Modal */}
      {showModal && (
        <MenuItemModal
          item={editItem}
          onClose={() => setShowModal(false)}
          onSave={async (data) => {
            try {
              if (editItem) {
                await api.put(`/menu/${editItem._id}`, data);
                toast.success('Item updated');
              } else {
                await api.post('/menu', data);
                toast.success('Item created');
              }
              fetchMenu();
              setShowModal(false);
            } catch (error) {
              toast.error('Failed to save item');
            }
          }}
        />
      )}
    </div>
  );
}

// Menu Item Modal Component
function MenuItemModal({ item, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || '',
    image: item?.image || '',
    category: item?.category || 'Main Course',
    serves: item?.serves || 1,
    preparationTime: item?.preparationTime || 15,
    ingredients: item?.ingredients?.join(', ') || '',
    allergens: item?.allergens || [],
    nutritionPerServing: item?.nutritionPerServing || {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      sodium: 0,
      fiber: 0
    }
  });

  const allergenOptions = ['Peanuts', 'Dairy', 'Gluten', 'Shellfish', 'Soy', 'Eggs', 'Tree Nuts', 'Sesame', 'Fish'];
  const categories = ['Appetizers', 'Main Course', 'Desserts', 'Drinks'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: parseFloat(formData.price),
      serves: parseInt(formData.serves),
      preparationTime: parseInt(formData.preparationTime),
      ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(Boolean)
    });
  };

  const toggleAllergen = (allergen) => {
    setFormData({
      ...formData,
      allergens: formData.allergens.includes(allergen)
        ? formData.allergens.filter(a => a !== allergen)
        : [...formData.allergens, allergen]
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-xl font-bold mb-4">{item ? 'Edit Item' : 'Add New Item'}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Image URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Ingredients (comma separated)</label>
            <input
              type="text"
              value={formData.ingredients}
              onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl"
              placeholder="Chicken, Rice, Vegetables"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Allergens</label>
            <div className="flex flex-wrap gap-2">
              {allergenOptions.map(allergen => (
                <button
                  key={allergen}
                  type="button"
                  onClick={() => toggleAllergen(allergen)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    formData.allergens.includes(allergen)
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {allergen}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Serves</label>
              <input
                type="number"
                value={formData.serves}
                onChange={(e) => setFormData({ ...formData, serves: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Prep Time (min)</label>
              <input
                type="number"
                value={formData.preparationTime}
                onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl"
              />
            </div>
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
              Save
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
