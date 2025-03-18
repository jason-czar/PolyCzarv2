import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import Home from './pages/Home';
import Markets from './pages/Markets';
import Portfolio from './pages/Portfolio';
import DatabaseSetup from './pages/DatabaseSetup';
import { ProtectedRoute, CustomSignIn, CustomSignUp, ProfileButton } from './components/AuthComponents';

function App() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    // Apply dark mode to the document on initial load and when mode changes
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-[#191B1C] text-gray-900 dark:text-white transition-colors duration-300">
        {/* Navigation Bar */}
        <nav className="bg-white dark:bg-[#191B1C] shadow-md">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link to="/" className="flex-shrink-0 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  PolyCzar
                </Link>
                <div className="ml-10 flex items-baseline space-x-4">
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                      isActive
                        ? 'px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500'
                        : 'px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  >
                    Home
                  </NavLink>
                  <NavLink
                    to="/markets"
                    className={({ isActive }) =>
                      isActive
                        ? 'px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500'
                        : 'px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  >
                    Markets
                  </NavLink>
                  <NavLink
                    to="/portfolio"
                    className={({ isActive }) =>
                      isActive
                        ? 'px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500'
                        : 'px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  >
                    Portfolio
                  </NavLink>
                  <SignedIn>
                    <NavLink
                      to="/db-setup"
                      className={({ isActive }) =>
                        isActive
                          ? 'px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500'
                          : 'px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    >
                      Database Setup
                    </NavLink>
                  </SignedIn>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
                
                {/* Authentication Component */}
                <SignedIn>
                  <ProfileButton />
                </SignedIn>
                <SignedOut>
                  <Link
                    to="/sign-in"
                    className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-150"
                  >
                    Sign In
                  </Link>
                </SignedOut>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="py-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/markets" element={<Markets />} />
            <Route path="/markets/:marketId" element={<Markets />} />
            <Route path="/portfolio" element={
              <ProtectedRoute>
                <Portfolio />
              </ProtectedRoute>
            } />
            <Route path="/db-setup" element={
              <ProtectedRoute>
                <DatabaseSetup />
              </ProtectedRoute>
            } />
            <Route path="/sign-in" element={<CustomSignIn />} />
            <Route path="/sign-up" element={<CustomSignUp />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-[#191B1C] shadow-md mt-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  2025 PolyCzar. All rights reserved.
                </span>
              </div>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  Terms
                </a>
                <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  Privacy
                </a>
                <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
