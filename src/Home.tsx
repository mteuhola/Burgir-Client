import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Home: React.FC = () => {
  // State to manage user login status
  // and user information
  const [user, setUser] = useState<{ id: number; name: string } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in by checking localStorage
    // and set the user state accordingly
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, [location]); // 👈 Depend on location changes!

  const handleLogout = () => {
    // Clear user data from localStorage and reset user state
    // Redirect to home page
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      {/* Logo */}
      <div className="mb-8">
      <img 
        src="/burgir.png" 
        alt="Restaurant Logo"
        style={{ width: '300px', height: '200px', objectFit: 'contain', borderRadius: '90%'}}
      />
      </div>

      {/* Welcome user */}
      {user && (
        <p className="text-gray-700 mb-6 text-lg font-semibold">
          Welcome, {user.name}!
        </p>
      )}

      {/* Buttons */}
      <div className="flex flex-col gap-4">
        {user ? (
          <>
            <Link to="/menu">
              <button className="px-6 py-3 bg-yellow-500 text-white rounded-2xl hover:bg-yellow-600 transition">
                View Menu
              </button>
            </Link>

            <Link to="/orders">
              <button className="px-6 py-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition">
                Orders
              </button>
            </Link>

            <Link to="/reservations">
              <button className="px-6 py-3 bg-purple-500 text-white rounded-2xl hover:bg-purple-600 transition">
                Reservations
              </button>
            </Link>

            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition">
              Log Out
            </button>


          </>
        ) : (
          <>

            <Link to="/menu">
              <button className="px-6 py-3 bg-yellow-500 text-white rounded-2xl hover:bg-yellow-600 transition">
                View Menu
              </button>
            </Link>

            <Link to="/login">
              <button className="px-6 py-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition">
                Log In
              </button>
            </Link>
          </>
        )}
        <Link to="/admin">
              <button className="px-6 py-3 bg-gray-250 text-black rounded-2xl hover:bg-gray-400 transition">
                Admin
              </button>
            </Link>
      </div>
    </div>
  );
};

export default Home;
