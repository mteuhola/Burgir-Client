import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from './config';

interface Table {
  id: number;
  min_people: number;
  max_people: number;
}

const AdminTables: React.FC = () => {
    // Define the state variables for tables, form mode, and error handling
  const [tables, setTables] = useState<Table[]>([]);
  const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState({ min_people: '', max_people: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const storedUser = localStorage.getItem('isAdmin');
    if (!storedUser) {
      setError('This page is for administrative personnel only.');
      return;
    }

    fetchTables();
  }, []);

  const fetchTables = async () => {
    // Fetch all tables from the API
    try {
      let all: Table[] = [];
      let url = `/api/tables/`;
      while (url) {
        const res = await axios.get(`${API_BASE}${url}`);
        all = [...all, ...(res.data.results || res.data)];
        url = res.data.next ? res.data.next.replace('https://burgirs.2.rahtiapp.fi', '') : '';
      }
      setTables(all);
    } catch (err) {
      console.error('Failed to load tables:', err);
      setError('Error loading tables.');
    }
  };

  const openAddForm = () => {
    // Open the form to add a new table
    setFormData({ min_people: '', max_people: '' });
    setFormMode('add');
    setEditingTable(null);
  };

  const openEditForm = (table: Table) => {
    // Open the form to edit an existing table
    setFormData({
      min_people: table.min_people.toString(),
      max_people: table.max_people.toString()
    });
    setFormMode('edit');
    setEditingTable(table);
  };

  const closeForm = () => {
    // Close the form and reset the state
    setFormMode(null);
    setEditingTable(null);
    setFormData({ min_people: '', max_people: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle input changes in the form
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Handle form submission for adding or editing a table
    const payload = {
      min_people: parseInt(formData.min_people),
      max_people: parseInt(formData.max_people)
    };

    if (payload.min_people > payload.max_people) {
      alert("Minimum people cannot be greater than maximum.");
      return;
    }

    try {
      if (formMode === 'add') {
        await axios.post(`${API_BASE}/api/tables/`, payload);
      } else if (formMode === 'edit' && editingTable) {
        await axios.put(`${API_BASE}/api/tables/${editingTable.id}/`, payload);
      }

      await fetchTables();
      closeForm();
    } catch (err) {
      console.error('Failed to save table:', err);
      alert('Failed to save table.');
    }
  };

  const handleDelete = async (id: number) => {
    // Confirm and delete a table
    if (!window.confirm('Are you sure you want to delete this table?')) return;
    try {
      await axios.delete(`${API_BASE}/api/tables/${id}/`);
      await fetchTables();
    } catch (err) {
      console.error('Failed to delete table:', err);
      alert('Failed to delete table.');
    }
  };

  if (error) return <div className="min-h-screen flex justify-center items-center text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow rounded-xl">
      <h1 className="text-3xl font-bold text-center mb-8">Manage Tables</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={openAddForm}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Add New Table
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tables.map(table => (
          <div key={table.id} className="border p-4 rounded-lg shadow-sm bg-gray-50 flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold">Table #{table.id}</h3>
              <p className="text-gray-600">Min: {table.min_people}</p>
              <p className="text-gray-600">Max: {table.max_people}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => openEditForm(table)}
                className="text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(table.id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {formMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{formMode === 'add' ? 'Add Table' : 'Edit Table'}</h3>

            <input
              name="min_people"
              type="number"
              placeholder="Min people"
              value={formData.min_people}
              onChange={handleChange}
              className="w-full mb-3 p-2 border rounded"
            />
            <input
              name="max_people"
              type="number"
              placeholder="Max people"
              value={formData.max_people}
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

export default AdminTables;
