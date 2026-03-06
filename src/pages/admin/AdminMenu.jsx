import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Search, Settings2, Flame, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', 'Appetizers', 'Main Course', 'Desserts', 'Drinks'];

  useEffect(() => { fetchMenu(); }, []);

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
      await api.patch(`/menu/${item._id}/availability`, { isAvailable: !item.isAvailable });
      setItems(items.map(i => i._id === item._id ? { ...i, isAvailable: !i.isAvailable } : i));
      toast.success(`${item.name} ${!item.isAvailable ? 'is now available' : 'marked as out of stock'}`);
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;
    try {
      await api.delete(`/menu/${item._id}`);
      setItems(items.filter(i => i._id !== item._id));
      toast.success('Item deleted successfully');
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const filteredItems = items.filter(item => {
    const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-sm text-gray-500">{items.length} items total</p>
        </div>
        <button
          onClick={() => { setEditItem(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 bg-white border-b border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu items..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat} onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  categoryFilter === cat ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-10"><p className="text-gray-400">No menu items found</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                  item.isAvailable ? 'border-gray-100' : 'border-red-200'
                }`}
                onClick={() => { setViewItem(item); setShowViewModal(true); }}
              >
                {/* Image */}
                <div className="relative h-40 bg-gray-100">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'; }} />
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xs font-bold bg-red-500 px-3 py-1 rounded-full">OUT OF STOCK</span>
                    </div>
                  )}
                  {item.isPopular && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-orange-500 rounded-lg flex items-center gap-1">
                      <Flame size={12} className="text-white" />
                      <span className="text-[10px] font-bold text-white">POPULAR</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg">
                    <span className="text-white text-sm font-bold">${item.price?.toFixed(2)}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="font-bold text-gray-900 text-sm truncate">{item.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1 mb-2">{item.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.customizableIngredients?.length > 0 && (
                      <span className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full font-medium flex items-center gap-0.5">
                        <Settings2 size={10} /> Customizable
                      </span>
                    )}
                    {item.allergens?.slice(0, 2).map(a => (
                      <span key={a} className="text-[10px] px-2 py-0.5 bg-red-50 text-red-500 rounded-full">{a}</span>
                    ))}
                    {item.allergens?.length > 2 && (
                      <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">+{item.allergens.length - 2}</span>
                    )}
                  </div>

                  {/* Nutrition */}
                  <div className="flex gap-2 mb-3">
                    <span className="text-[10px] px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded font-medium">
                      {item.nutritionPerServing?.calories || 0} cal
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-medium">
                      {item.nutritionPerServing?.protein || 0}g protein
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={item.isAvailable ? 'available' : 'out_of_stock'}
                      onChange={(e) => {
                        const shouldBeAvailable = e.target.value === 'available';
                        if (shouldBeAvailable !== item.isAvailable) toggleAvailability(item);
                      }}
                      className={`flex-1 py-2 px-2 text-xs font-medium rounded-lg border-0 appearance-none cursor-pointer transition-colors ${
                        item.isAvailable
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                      style={{ backgroundImage: 'none' }}
                    >
                      <option value="available">✅ Available</option>
                      <option value="out_of_stock">🚫 Out of Stock</option>
                    </select>
                    <button onClick={() => { setEditItem(item); setShowModal(true); }}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(item)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {showViewModal && viewItem && (
          <ViewItemModal item={viewItem} onClose={() => { setShowViewModal(false); setViewItem(null); }} />
        )}
      </AnimatePresence>

      {/* Edit/Add Modal */}
      <AnimatePresence>
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
      </AnimatePresence>
    </div>
  );
}

// ─── View Item Modal ─────────────────────────────────────────────────────────
function ViewItemModal({ item, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-48 bg-gray-100">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
              <p className="text-sm text-gray-500">{item.category}</p>
            </div>
            <span className="text-xl font-bold text-orange-600">${item.price?.toFixed(2)}</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">{item.description}</p>

          {/* Status */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.isAvailable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {item.isAvailable ? 'Available' : 'Out of Stock'}
            </span>
            {item.isPopular && <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-600">Popular</span>}
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">Serves {item.serves} | {item.preparationTime}min</span>
          </div>

          {/* Nutrition */}
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-2">Nutrition Per Serving</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Calories', value: item.nutritionPerServing?.calories, unit: 'kcal', bg: 'bg-orange-50' },
                { label: 'Protein', value: item.nutritionPerServing?.protein, unit: 'g', bg: 'bg-blue-50' },
                { label: 'Carbs', value: item.nutritionPerServing?.carbs, unit: 'g', bg: 'bg-green-50' },
                { label: 'Fat', value: item.nutritionPerServing?.fat, unit: 'g', bg: 'bg-purple-50' },
                { label: 'Sodium', value: item.nutritionPerServing?.sodium, unit: 'mg', bg: 'bg-red-50' },
                { label: 'Fiber', value: item.nutritionPerServing?.fiber, unit: 'g', bg: 'bg-emerald-50' },
              ].map(n => (
                <div key={n.label} className={`p-2 ${n.bg} rounded-lg text-center`}>
                  <p className="text-lg font-bold text-gray-900">{n.value || 0}</p>
                  <p className="text-[10px] text-gray-500">{n.label} ({n.unit})</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          {item.ingredients?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-700 mb-2">Ingredients</h3>
              <div className="flex flex-wrap gap-1.5">
                {item.ingredients.map(ing => (
                  <span key={ing} className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    item.customizableIngredients?.includes(ing)
                      ? 'bg-purple-100 text-purple-600 border border-purple-200'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {ing}{item.customizableIngredients?.includes(ing) ? ' (customizable)' : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Allergens */}
          {item.allergens?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-700 mb-2">Allergens</h3>
              <div className="flex flex-wrap gap-1.5">
                {item.allergens.map(a => (
                  <span key={a} className="text-xs px-2.5 py-1 bg-red-100 text-red-600 rounded-full font-medium">{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Spice Level */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-2">Default Spice Level</h3>
            <div className="flex gap-1">
              {[0, 1, 2, 3].map(level => (
                <div key={level} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                  level <= (item.defaultSpiceLevel || 0) ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>{level}</div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Menu Item Modal (Add/Edit) ──────────────────────────────────────────────
function MenuItemModal({ item, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || '',
    image: item?.image || '',
    category: item?.category || 'Main Course',
    serves: item?.serves || 1,
    preparationTime: item?.preparationTime || 15,
    defaultSpiceLevel: item?.defaultSpiceLevel || 0,
    isPopular: item?.isPopular || false,
    ingredients: item?.ingredients?.join(', ') || '',
    customizableIngredients: item?.customizableIngredients || [],
    allergens: item?.allergens || [],
    nutritionPerServing: item?.nutritionPerServing || { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 0, fiber: 0 }
  });

  const allergenOptions = ['Peanuts', 'Dairy', 'Gluten', 'Shellfish', 'Soy', 'Eggs', 'Tree Nuts', 'Sesame', 'Fish'];
  const categoryOptions = ['Appetizers', 'Main Course', 'Desserts', 'Drinks'];
  const ingredientList = formData.ingredients.split(',').map(i => i.trim()).filter(Boolean);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!formData.name || !formData.description || !formData.price || !formData.image) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSave({
      ...formData,
      price: parseFloat(formData.price),
      serves: parseInt(formData.serves),
      preparationTime: parseInt(formData.preparationTime),
      defaultSpiceLevel: parseInt(formData.defaultSpiceLevel),
      ingredients: ingredientList,
      nutritionPerServing: {
        calories: parseInt(formData.nutritionPerServing.calories) || 0,
        protein: parseFloat(formData.nutritionPerServing.protein) || 0,
        carbs: parseFloat(formData.nutritionPerServing.carbs) || 0,
        fat: parseFloat(formData.nutritionPerServing.fat) || 0,
        sodium: parseFloat(formData.nutritionPerServing.sodium) || 0,
        fiber: parseFloat(formData.nutritionPerServing.fiber) || 0,
      }
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

  const toggleCustomizable = (ingredient) => {
    setFormData({
      ...formData,
      customizableIngredients: formData.customizableIngredients.includes(ingredient)
        ? formData.customizableIngredients.filter(i => i !== ingredient)
        : [...formData.customizableIngredients, ingredient]
    });
  };

  const updateNutrition = (field, value) => {
    setFormData({
      ...formData,
      nutritionPerServing: { ...formData.nutritionPerServing, [field]: value }
    });
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'ingredients', label: 'Ingredients' },
    { id: 'nutrition', label: 'Nutrition' },
    { id: 'customization', label: 'Customization' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{item ? 'Edit Item' : 'Add New Item'}</h2>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-3 border-b border-gray-100">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4">
          {/* Basic Info */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Description *</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" rows={3} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Price ($) *</label>
                  <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Category *</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                    {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Image URL *</label>
                <input type="url" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required />
                {formData.image && (
                  <div className="mt-2 w-full h-32 rounded-xl overflow-hidden bg-gray-100">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Serves</label>
                  <input type="number" min="1" value={formData.serves} onChange={(e) => setFormData({ ...formData, serves: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Prep Time (min)</label>
                  <input type="number" min="1" value={formData.preparationTime} onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isPopular} onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500" />
                <span className="text-sm font-medium text-gray-700">Mark as Popular</span>
              </label>
            </div>
          )}

          {/* Ingredients */}
          {activeTab === 'ingredients' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Ingredients (comma separated)</label>
                <textarea value={formData.ingredients} onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" rows={3}
                  placeholder="Chicken, Rice, Vegetables, Garlic..." />
              </div>
              {ingredientList.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Current Ingredients ({ingredientList.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {ingredientList.map(ing => (
                      <span key={ing} className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full font-medium">{ing}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="pt-4 border-t border-gray-100">
                <label className="text-sm font-medium text-gray-700 block mb-2">Allergens</label>
                <div className="flex flex-wrap gap-2">
                  {allergenOptions.map(allergen => (
                    <button key={allergen} type="button" onClick={() => toggleAllergen(allergen)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        formData.allergens.includes(allergen) ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      {allergen}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Nutrition */}
          {activeTab === 'nutrition' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Enter nutritional information per serving.</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'calories', label: 'Calories (kcal)', step: '1' },
                  { key: 'protein', label: 'Protein (g)', step: '0.1' },
                  { key: 'carbs', label: 'Carbs (g)', step: '0.1' },
                  { key: 'fat', label: 'Fat (g)', step: '0.1' },
                  { key: 'sodium', label: 'Sodium (mg)', step: '1' },
                  { key: 'fiber', label: 'Fiber (g)', step: '0.1' },
                ].map(n => (
                  <div key={n.key}>
                    <label className="text-sm font-medium text-gray-700 block mb-1">{n.label}</label>
                    <input type="number" step={n.step} min="0" value={formData.nutritionPerServing[n.key]}
                      onChange={(e) => updateNutrition(n.key, e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customization */}
          {activeTab === 'customization' && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Default Spice Level</label>
                <div className="flex gap-2">
                  {[{ level: 0, label: 'None' }, { level: 1, label: 'Mild' }, { level: 2, label: 'Medium' }, { level: 3, label: 'Hot' }].map(s => (
                    <button key={s.level} type="button" onClick={() => setFormData({ ...formData, defaultSpiceLevel: s.level })}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        formData.defaultSpiceLevel === s.level ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Customizable Ingredients</label>
                <p className="text-xs text-gray-400 mb-3">Select which ingredients customers can choose to remove when ordering.</p>
                {ingredientList.length === 0 ? (
                  <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-sm text-gray-400">Add ingredients in the Ingredients tab first</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ingredientList.map(ing => (
                      <label key={ing}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                          formData.customizableIngredients.includes(ing) ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}>
                        <div className="flex items-center gap-3">
                          <input type="checkbox" checked={formData.customizableIngredients.includes(ing)}
                            onChange={() => toggleCustomizable(ing)} className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500" />
                          <span className="text-sm font-medium text-gray-700">{ing}</span>
                        </div>
                        {formData.customizableIngredients.includes(ing) && (
                          <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full font-medium">Removable</span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {formData.customizableIngredients.length > 0 && (
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <p className="text-xs font-semibold text-purple-700 mb-2">Customizable Summary ({formData.customizableIngredients.length} ingredients)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.customizableIngredients.map(ing => (
                      <span key={ing} className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full">{ing}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit}
            className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors">
            {item ? 'Update Item' : 'Create Item'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
