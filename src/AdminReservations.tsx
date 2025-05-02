import React, { useEffect, useState } from 'react';
import { fetchAllPaginated } from './fetchAllPaginated';

interface Reservation {
  id: number;
  user: number;
  table: number;
  number_of_people: number;
  date_and_time: string;
  duration: string;
}

interface User {
  id: number;
  name: string;
}

interface Table {
  id: number;
  min_people: number;
  max_people: number;
}

const AdminReservations: React.FC = () => {
    // Define the state variables for reservations, users, and tables
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const setTables = useState<Table[]>([])[1];
  const [viewMode, setViewMode] = useState<'upcoming' | 'past'>('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const storedUser = localStorage.getItem('isAdmin');
    if (!storedUser) {
      setError('This page is for administrative personnel only.');
      return;
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const fetchData = async () => {
    // Fetch all reservations, users, and tables
    try {
      const [res, users, tables] = await Promise.all([
        fetchAllPaginated<Reservation>('/api/reservations/'),
        fetchAllPaginated<User>('/api/users/'),
        fetchAllPaginated<Table>('/api/tables/')
      ]);
      setReservations(res);
      setUsers(users);
      setTables(tables);
    } catch (err) {
      console.error('Failed to fetch reservations:', err);
      setError('Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string) =>
    // Format the date to a more readable format
    // using the user's locale and timezone settings
    new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

  const findUser = (id: number) => users.find(u => u.id === id)?.name || `User #${id}`;

  const filteredReservations = reservations
    .filter(r => {
      const now = new Date();
      const date = new Date(r.date_and_time);
      return viewMode === 'upcoming' ? date >= now : date < now;
    })
    .sort((a, b) => new Date(b.date_and_time).getTime() - new Date(a.date_and_time).getTime());

  if (error) return <div className="min-h-screen flex justify-center items-center text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow rounded-xl">
      <h1 className="text-3xl font-bold text-center mb-6">Manage Reservations</h1>

      <div className="flex justify-center mb-6">
        <button
          onClick={() => setViewMode('upcoming')}
          className={`px-4 py-2 mr-2 rounded ${
            viewMode === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setViewMode('past')}
          className={`px-4 py-2 rounded ${
            viewMode === 'past' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Past
        </button>
      </div>

      {loading && <p>Loading reservations...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {filteredReservations.length === 0 ? (
        <p className="text-center text-gray-600">No {viewMode} reservations found.</p>
      ) : (
        <ul className="space-y-4">
          {filteredReservations.map(res => (
            <li key={res.id} className="p-4 border rounded bg-gray-50 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold">{formatDate(res.date_and_time)}</p>
                  <p className="text-sm text-gray-700">User: {findUser(res.user)}</p>
                  <p className="text-sm">People: {res.number_of_people}</p>
                  <p className="text-sm">Table: #{res.table}</p>
                </div>
                <div className="text-sm text-gray-500">
                  Duration: {res.duration}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminReservations;
