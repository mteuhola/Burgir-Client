import { Routes, Route } from 'react-router-dom';
// Importing page components
import Home from "./Home";
import Menu from './Menu';
import Login from './Login';
import Reservations from './Reservations';
import MyReservations from './MyReservations';
import Orders from './Orders';
import NavBar from './NavBar';
// Admin components
import AdminLogin from './AdminLogin';
import AdminMenu from './AdminMenu';
import AdminTables from './AdminTables';
import AdminOrders from './AdminOrders';
import AdminReservations from './AdminReservations';

const App: React.FC = () => {
  return (
    <>
    <NavBar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reservations" element={<Reservations />} />
      <Route path="/my-reservations" element={<MyReservations />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/menu" element={<AdminMenu />} />
      <Route path="/admin/tables" element={<AdminTables />} />
      <Route path="/admin/orders" element={<AdminOrders />} />
      <Route path="/admin/reservations" element={<AdminReservations />} />
    </Routes>
    </>
  );
};
export default App;