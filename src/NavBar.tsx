import { Link, useNavigate, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

const NavBar: React.FC = () => {
  // State to manage user and admin status
  const [user, setUser] = useState<{ id: number; name: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in by checking localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminStatus);
  }, [location]);

  const handleLogout = () => {
    // Clear user data from localStorage and reset user state
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md flex justify-between items-center px-8 py-4">
      <div className="text-xl font-bold text-gray-700">
        <Link to="/">🍔 Burgir</Link>
      </div>

      <div className="flex gap-4 items-center">
        {/* Normal user navbar */}
        {!isAdmin && (
          <>
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
              </>
            ) : (
              <Link to="/login" className="text-gray-700 hover:text-blue-600 font-semibold">
                Login
              </Link>
            )}
          </>
        )}

        {/* Admin navbar */}
        {isAdmin && (
          <>
            <Link to="/admin/menu" className="text-gray-700 hover:text-blue-600 font-semibold">
              Manage Menu
            </Link>
            <Link to="/admin/tables" className="text-gray-700 hover:text-blue-600 font-semibold">
              Manage Tables
            </Link>
            <Link to="/admin/orders" className="text-gray-700 hover:text-blue-600 font-semibold">
              Manage Orders
            </Link>
            <Link to="/admin/reservations" className="text-gray-700 hover:text-blue-600 font-semibold">
              Manage Reservations
            </Link>
          </>
        )}

        {(user || isAdmin) && (
          <button
            onClick={handleLogout}
            className="ml-4 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded font-semibold"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
