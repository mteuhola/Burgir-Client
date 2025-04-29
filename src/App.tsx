import { Routes, Route } from 'react-router-dom';
import Home from "./Home";
import Menu from './Menu';
import Login from './Login';
import Reservations from './Reservations';
import Orders from './Orders';
import NavBar from './NavBar';

const App: React.FC = () => {
  return (
    <>
    <NavBar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reservations" element={<Reservations />} />
      <Route path="/orders" element={<Orders />} />
    </Routes>
    </>
  );
};
export default App;