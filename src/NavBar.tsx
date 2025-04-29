import { Link, useNavigate, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

const NavBar: React.FC = () => {
  const [user, setUser] = useState<{ id: number; name: string } | null>(null);
  const navigate = useNavigate();
  const location = useLocation(); // 👈 NEW

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, [location]); // 👈 Depend on location!

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md flex justify-between items-center px-8 py-4">
      <div className="text-xl font-bold text-gray-700">
        <Link to="/">🍔 Burgir</Link>
      </div>

      <div className="flex gap-6 items-center">
        <Link to="/menu" className="text-gray-700 hover:text-blue-600 font-semibold">
          Menu
        </Link>

        {user ? (
          <>
            <Link to="/reservations" className="text-gray-700 hover:text-blue-600 font-semibold">
              Reservations
            </Link>
            <Link to="/orders" className="text-gray-700 hover:text-blue-600 font-semibold">
              Orders
            </Link>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-700 font-semibold"
            >
              Log Out
            </button>
          </>
        ) : (
          <Link to="/login" className="text-gray-700 hover:text-blue-600 font-semibold">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
