import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from './config'; // Adjust if needed
import { Link } from 'react-router-dom';

interface Table {
  id: number;
  min_people: number;
  max_people: number;
}

interface Reservation {
  id: number;
  user: number;
  table: number;
  number_of_people: number;
  date_and_time: string;
  duration: string;
}

const ReservationForm: React.FC = () => {
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration] = useState('02:00:00');
  const openingHours = { start: 10, end: 22 };

  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTablesAndReservations = async () => {
      try {
        const [tableRes, reservationRes] = await Promise.all([
          axios.get(`${API_BASE}/api/tables/`),
          axios.get(`${API_BASE}/api/reservations/`)
        ]);

        setTables(tableRes.data.results || tableRes.data);
        setReservations(reservationRes.data.results || reservationRes.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Could not load reservation data.');
      }
    };

    fetchTablesAndReservations();
  }, []);

  const parseDuration = (durationStr: string): number => {
    const [h, m, s] = durationStr.split(':').map(Number);
    return ((h * 60 + m) * 60 + s) * 1000;
  };

  const generateTimeSlots = (startHour = openingHours.start, endHour = openingHours.end - 2) => {
    const slots: string[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let min of [0, 30]) {
        const h = hour.toString().padStart(2, '0');
        const m = min.toString().padStart(2, '0');
        slots.push(`${h}:${m}`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleSubmit = async () => {
    setMessage(null);
    setError(null);
    setLoading(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user?.id) {
      setError('You must be logged in to make a reservation.');
      setLoading(false);
      return;
    }

    if (!date || !time) {
      setError('Please select both date and time.');
      setLoading(false);
      return;
    }

    const dateTimeStr = `${date}T${time}:00Z`;
    const start = new Date(dateTimeStr);
    const end = new Date(start.getTime() + parseDuration(duration));

    const suitableTables = tables.filter(t =>
      numberOfPeople >= t.min_people && numberOfPeople <= t.max_people
    );

    let foundTable = null;

    for (const table of suitableTables) {
      const overlapping = reservations.some(res => {
        if (res.table !== table.id) return false;

        const resStart = new Date(res.date_and_time);
        const resEnd = new Date(resStart.getTime() + parseDuration(res.duration));

        return start < resEnd && resStart < end;
      });

      if (!overlapping) {
        foundTable = table;
        break;
      }
    }

    if (!foundTable) {
      setError('No available table for that time and group size.');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API_BASE}/api/reservations/`, {
        user: user.id,
        table: foundTable.id,
        number_of_people: numberOfPeople,
        date_and_time: dateTimeStr,
        duration: duration
      });

      setMessage(`✅ Reserved table #${foundTable.id} on ${date} at ${time}`);
    } catch (err) {
      console.error('Reservation failed:', err);
      setError('Reservation failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 shadow rounded-xl">
      <Link to="/my-reservations">
        <div className="mb-6 flex justify-center items-center">
          <button className="px-6 py-3 bg-green-500 text-white rounded-2xl hover:bg-green-600 transition text-center">
            View My Reservations
          </button>
        </div>
      </Link>

      <h2 className="text-2xl font-bold mb-6 text-center">Reserve a Table</h2>

      {message && <div className="bg-green-100 text-green-700 p-3 mb-4 rounded">{message}</div>}
      {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}

      <label className="block mb-2 font-semibold">Number of people</label>
      <input
        type="number"
        value={numberOfPeople}
        min={1} max={10}
        onChange={(e) => setNumberOfPeople(Number(e.target.value))}
        className="w-full p-2 mb-4 border rounded"
      />

      <p className="mb-6 text-gray-600 text-sm">
        For groups larger than 10 people, <strong>contact us!</strong>
      </p>

      <label className="block mb-2 font-semibold">Date</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />

      <label className="block mb-2 font-semibold">Time</label>
      <select
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      >
        <option value="">-- Select Time --</option>
        {timeSlots.map((slot) => (
          <option key={slot} value={slot}>{slot}</option>
        ))}
      </select>

      <p className="mb-6 text-gray-600 text-sm">
        <strong>Note: </strong>The kitchen closes half an hour before closing!
      </p>

      <p className="mb-6 text-gray-600 text-sm">
        All reservations last <strong>2 hours</strong>.
      </p>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
      >
        {loading ? 'Reserving...' : 'Check Availability & Reserve'}
      </button>
    </div>
  );
};

export default ReservationForm;
