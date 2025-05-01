import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from './config';

import axios from 'axios';

interface User {
  id: number;
  name: string;
}

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const navigate = useNavigate();

  const fetchAllUsers = async (): Promise<User[]> => {
    let allUsers: User[] = [];
    let url = '/api/users/';

    while (url) {
      const response = await axios.get(`${API_BASE}${url}`);
      allUsers = [...allUsers, ...response.data.results];
      url = response.data.next ? response.data.next.replace('https://burgirs.2.rahtiapp.fi', '') : '';
    }

    return allUsers;
  };

  const handleLoginOrSignUp = async () => {
    if (!username.trim()) {
      setError('Please enter a name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const users = await fetchAllUsers();

      const foundUser = users.find((user: User) => user.name.toLowerCase() === username.toLowerCase());

      if (isSignUp) {
        // SIGN UP flow
        if (foundUser) {
          setError('Username already taken.');
        } else {
          const createResponse = await axios.post(`${API_BASE}/api/users/`, { name: username },  {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          console.log(createResponse.data)
          localStorage.setItem('user', JSON.stringify(createResponse.data));
          navigate('/');
        }
      } else {
        // LOGIN flow
        if (foundUser) {
          localStorage.setItem('user', JSON.stringify(foundUser));
          navigate('/');
        } else {
          setError('User not found.');
        }
      }
    } catch (err) {
      console.error('Error during login/signup:', err);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isSignUp ? 'Create Account' : 'Login'}
        </h1>

        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <button
          onClick={handleLoginOrSignUp}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (isSignUp ? 'Creating account...' : 'Logging in...') : (isSignUp ? 'Create Account' : 'Log In')}
        </button>

        <p className="text-center text-gray-600 mt-4">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(prev => !prev)}
            className="text-blue-500 hover:underline"
          >
            {isSignUp ? 'Log in' : 'Create one'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
