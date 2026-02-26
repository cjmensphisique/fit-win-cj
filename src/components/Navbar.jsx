import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  LogOut 
} from 'lucide-react';
import logo from '../assets/logo.jpeg';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isLandingPage = location.pathname === '/';
  const isAdmin = user?.role === 'admin';
  const prefix = isAdmin ? '/admin' : '/client';
  
  const WHATSAPP_NUMBER = "8667600388";
  const WHATSAPP_LINK = `https://wa.me/91${WHATSAPP_NUMBER}?text=Hey!%20I'm%20interested%20in%20joining%20CJ%20Fitness!`;

  const navItems = user ? [
    { name: 'Dashboard', path: prefix, icon: LayoutDashboard },
    ...(isAdmin ? [
      { name: 'Clients', path: `${prefix}/clients`, icon: Users },
    ] : []),
  ] : [];

  const isActive = (path) => {
      // Check if current path matches or is a sub-path
      if (path === prefix && location.pathname === prefix) return true;
      if (path !== prefix && location.pathname.startsWith(path)) return true;
      return false;
  };

  return (
    <nav className="bg-dark-card border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to={prefix} className="flex-shrink-0 flex items-center space-x-3">
              <img 
                src={logo} 
                alt="CJ Fitness Logo" 
                className="w-10 h-10 rounded-lg object-cover border border-gray-700 shadow-lg"
              />
              <span className="text-2xl font-bold transform skew-x-[-10deg]">
                <span style={{ color: '#ffc105' }}>CJ</span> <span className="text-white">FITNESS</span>
              </span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-yellow-400 text-black'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-white">{isAdmin ? 'CJ' : (user.name || user.email)}</div>
                  <div className="text-xs text-gray-400 capitalize">{user.role} Portal</div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => {
                    const el = document.getElementById('how-it-works');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      navigate('/');
                      setTimeout(() => {
                        document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }
                  }}
                  className="text-gray-400 hover:text-white text-sm font-medium transition-colors hidden md:block"
                >
                  The Roadmap
                </button>
                <Link
                  to="/login"
                  className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
                >
                  Member Login
                </Link>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-yellow-400 text-black rounded-full text-sm font-bold hover:bg-yellow-500 transition-colors"
                >
                  Join the Elite
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
