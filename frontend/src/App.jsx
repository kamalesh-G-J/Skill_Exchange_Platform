import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Matches from './pages/Matches';
import Profile from './pages/Profile';
import Requests from './pages/Requests';
import Sessions from './pages/Sessions';

const Navbar = () => {
  const { token, logout } = useAuth();
  
  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-blue-600">
        <Link to="/">Skill Exchange Platform</Link>
      </h1>
      <div className="flex gap-4 items-center">
        {token ? (
          <>
            <Link to="/" className="text-gray-600 hover:text-blue-600">Matches</Link>
            <Link to="/requests" className="text-gray-600 hover:text-blue-600">Requests</Link>
            <Link to="/sessions" className="text-gray-600 hover:text-blue-600">Sessions</Link>
            <Link to="/profile" className="text-gray-600 hover:text-blue-600">Profile</Link>
            <button 
              onClick={logout} 
              className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-600 hover:text-blue-600">Login</Link>
            <Link to="/register" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Matches />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/requests" 
                element={
                  <ProtectedRoute>
                    <Requests />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/sessions" 
                element={
                  <ProtectedRoute>
                    <Sessions />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
