import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { CircleUserRound } from 'lucide-react';

const Navbar = ({ handleLogout, email, role }) => {
  const getHomeRoute = () => {
    switch (role) {
      case 'admin':
        return '/admin-home';
      case 'faculty':
        return '/faculty-home';
      default:
        return '/login';
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#290001] text-[#DBCBBD] p-3 sm:p-3 flex justify-between items-center shadow-lg shadow-[#C87941]/30">
      {/* Logo + Title */}
      <Link to={getHomeRoute()} state={{ email }} className="flex items-center space-x-1.5 sm:space-x-3 cursor-pointer">
        <img src={logo} className="h-8 sm:h-12 w-auto" />
        <div>
          <h1 className="text-xs sm:text-xl font-bold tracking-tight">PSG COLLEGE OF TECHNOLOGY</h1>
          <p className="text-xs sm:text-sm md:text-base font-bold tracking-wide">
            EVENT MANAGEMENT SYSTEM
          </p>
        </div>
      </Link>

      {/* Logout */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        <Link
          to="/profile"
          state={{ email }}
          title="Profile"
          className="transition-all duration-200 hover:opacity-90"
        >
          <CircleUserRound className="text-white h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2} />
        </Link>
        <button
          onClick={handleLogout}
          className="bg-[#87431D] hover:bg-[#C87941] hover:text-[#DBCBBD] text-[#DBCBBD] px-4 py-2 sm:px-4 sm:py-1 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
