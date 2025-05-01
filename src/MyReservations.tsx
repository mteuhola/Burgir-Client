import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from './config';
import { Link } from 'react-router-dom';

interface Reservation {
  id: number;
  user: number;
  table: number;
  number_of_people: number;
  date_and_time: string;
  duration: string;
}

const MyReservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user?.id) {
        setError('You must be logged in to view reservations.');
        setLoading(false);
        return;
      }

      try {
        // Fetch all reservations
        let userRes: Reservation[] = [];
        let url = `api/users/${user.id}/reservations/`;

        const res = await axios.get(`${API_BASE}${url}`);
        userRes = res.data;

        // Sort reservations descending (most recent first)
        userRes.sort((a, b) => new Date(b.date_and_time).getTime() - new Date(a.date_and_time).getTime());

        setReservations(userRes);
      } catch (err) {
        console.error('Failed to fetch reservations:', err);
        setError('Error fetching your reservations.');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const formatDate = (iso: string) => new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const isUpcoming = (iso: string) => {
    return new Date(iso) > new Date();
  };

  const cancelReservation = async (id: number) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) return;

    try {
      setDeletingId(id);
      await axios.delete(`${API_BASE}/api/reservations/${id}/`);
      setReservations(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to cancel reservation:', err);
      alert('Failed to cancel reservation.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-6 shadow rounded-xl">
        <Link to="/reservations">
            <div className="mb-6 flex justify-center items-center">
                <button className="px-6 py-3 bg-green-500 text-white rounded-2xl hover:bg-green-600 transition text-center">
                Return to making reservations
                </button>
            </div>
        </Link>
      <h2 className="text-2xl font-bold mb-6 text-center">My Reservations</h2>

      {loading && <p>Loading your reservations...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && reservations.length === 0 && <p>You have no reservations yet.</p>}

      {reservations.length > 0 && (
        <ul className="space-y-4">
          {reservations.map((res) => (
            <li key={res.id} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-start">
              <div>
                <p className="font-bold">{formatDate(res.date_and_time)}</p>
                <p>Reservation ID: {res.id}</p>
                <p>Guests: {res.number_of_people}</p>
                <p className={`mt-1 text-sm ${isUpcoming(res.date_and_time) ? 'text-green-600' : 'text-gray-500'}`}>
                  {isUpcoming(res.date_and_time) ? 'Upcoming' : 'Past'}
                </p>
              </div>

              {/* Cancel button only for upcoming */}
              {isUpcoming(res.date_and_time) && (
                <button
                  onClick={() => cancelReservation(res.id)}
                  className="ml-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                  disabled={deletingId === res.id}
                >
                  {deletingId === res.id ? 'Cancelling...' : 'Cancel'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyReservations;
