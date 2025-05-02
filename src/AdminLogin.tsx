import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ADMIN_HASH = '1dd83078d7f246bfcd3d85cbd2c729d4789c25a48343086c1a95e73b5a1a9e26';

const AdminLogin: React.FC = () => {
    // State variables
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [verified, setVerified] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check if 'isAdmin' exists in localStorage
        if (localStorage.getItem('isAdmin')) {
          setVerified(true);
        }
      }, [location]);

  const hashPassword = async (input: string): Promise<string> => {
    // Use the SubtleCrypto API to hash the password using SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSubmit = async () => {
    // Validate input
    setError(null);
    const hash = await hashPassword(password);

    if (hash === ADMIN_HASH) {
        localStorage.setItem('isAdmin', 'true');
        localStorage.removeItem('user');
        setVerified(true);
        // ✅ Trigger location change to refresh NavBar
        navigate('/admin', { replace: true });
    } else {
    setError('Incorrect admin password.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-6 shadow rounded-xl">
      {!verified ? (
  <>
    <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
    <input
      type="password"
      placeholder="Enter admin password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="w-full p-2 mb-4 border rounded"
    />
    {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
    <button
      onClick={handleSubmit}
      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
    >
      Submit
    </button>
  </>
) : (
    <div>
        <h2 className="text-2xl font-bold mb-6 text-center">🔐 Admin Panel</h2>

        <div className="grid grid-cols-1 gap-4">
        <button
            onClick={() => navigate('/admin/menu')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
            Manage Menu
        </button>

        <button
            onClick={() => navigate('/admin/tables')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
            Manage Tables
        </button>

        <button
            onClick={() => navigate('/admin/orders')}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
            Manage Orders
        </button>

        <button
            onClick={() => navigate('/admin/reservations')}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
            Manage Reservations
        </button>
        </div>

        {/* Sign out user */}
        {localStorage.getItem('user') && (
        <button
            onClick={() => {
            localStorage.removeItem('user');
            alert('User signed out.');
            }}
            className="mt-6 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition">
            Sign out current user
        </button>
        )}

        <button
        onClick={() => navigate('/')}
        className="mt-4 w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition">
        Back to Home
        </button>
    </div>
    )}
    </div>
  );
};

export default AdminLogin;
