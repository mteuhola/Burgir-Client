import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from './config';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  type: string;
  price: number;
}

const AdminMenu: React.FC = () => {
    // Define the state variables for menu items, grouped items, form mode, editing item, form data, and error
  const setMenuItems = useState<MenuItem[]>([])[1];
  const [groupedItems, setGroupedItems] = useState<Record<string, MenuItem[]>>({});
  const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', type: '', price: '' });
  const [error, setError] = useState<string | null>(null);

  const types = ['appetizer', 'main course', 'drink', 'snack', 'dessert'];
  const categoryOrder = types;

  useEffect(() => {
    // Check if the user is an admin

    const storedUser = localStorage.getItem('isAdmin');
    if (!storedUser) {
      setError('This page is for administrative personnel only.');
      return;
    }

    fetchMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMenu = async () => {
    // Fetch all menu items from the API
    try {
      let allItems: MenuItem[] = [];
      let url = `${API_BASE}/api/menu-items/`;
      while (url) {
        const res = await axios.get(url);
        allItems = [...allItems, ...(res.data.results || res.data)];
        url = res.data.next ? res.data.next.replace('https://burgirs.2.rahtiapp.fi', '') : '';
      }
      setMenuItems(allItems);
      const grouped = allItems.reduce((acc: Record<string, MenuItem[]>, item) => {
        acc[item.type] = acc[item.type] || [];
        acc[item.type].push(item);
        return acc;
      }, {});
      setGroupedItems(grouped);
    } catch (err) {
      console.error('Failed to load menu:', err);
      setError('Error loading menu.');
    }
  };

  const openAddForm = () => {
    // Open the form for adding a new menu item
    setFormData({ name: '', description: '', type: '', price: '' });
    setFormMode('add');
    setEditingItem(null);
  };

  const openEditForm = (item: MenuItem) => {
    // Open the form for editing an existing menu item
    setFormData({
      name: item.name,
      description: item.description,
      type: item.type,
      price: item.price.toString()
    });
    setFormMode('edit');
    setEditingItem(item);
  };

  const closeForm = () => {
    // Close the form and reset the state
    setFormMode(null);
    setEditingItem(null);
    setFormData({ name: '', description: '', type: '', price: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Validate the form data
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        price: parseFloat(formData.price),
      };

      if (formMode === 'add') {
        await axios.post(`${API_BASE}/api/menu-items/`, payload);
      } else if (formMode === 'edit' && editingItem) {
        await axios.put(`${API_BASE}/api/menu-items/${editingItem.id}/`, payload);
      }

      await fetchMenu();
      closeForm();
    } catch (err) {
      console.error('Failed to save item:', err);
      alert('Failed to save item.');
    }
  };

  const handleDelete = async (id: number) => {
    // Confirm and delete a menu item
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`${API_BASE}/api/menu-items/${id}/`);
      await fetchMenu();
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('Failed to delete item.');
    }
  };

  if (error) return <div className="min-h-screen flex justify-center items-center text-red-500">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow rounded-xl">
      <h1 className="text-3xl font-bold text-center mb-8">Manage Menu</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={openAddForm}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Add New Item
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {categoryOrder.map(type => (
        <div key={type} className="mb-10">
          <h2 className="text-2xl font-semibold capitalize mb-4">{type}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(groupedItems[type] || []).map(item => (
              <div key={item.id} className="border p-4 rounded-lg shadow-sm flex flex-col justify-between bg-gray-50">
                <div>
                  <h3 className="text-lg font-bold">{item.name}</h3>
                  <p className="text-gray-600 mb-1">{item.description}</p>
                  <p className="font-semibold">{item.price.toFixed(2)} €</p>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => openEditForm(item)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Modal Form */}
      {formMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{formMode === 'add' ? 'Add Menu Item' : 'Edit Menu Item'}</h3>

            <input
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full mb-3 p-2 border rounded"
            />

            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              className="w-full mb-3 p-2 border rounded"
            />

            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full mb-3 p-2 border rounded"
            >
              <option value="">Select type</option>
              {types.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <input
              name="price"
              type="number"
              step="0.01"
              placeholder="Price (€)"
              value={formData.price}
              onChange={handleChange}
              className="w-full mb-4 p-2 border rounded"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={closeForm}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenu;
