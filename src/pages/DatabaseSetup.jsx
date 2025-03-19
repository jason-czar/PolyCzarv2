import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DatabaseSetup = () => {
  const { user, isLoaded } = useUser();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCreated, setUserCreated] = useState(false);
  const [message, setMessage] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  useEffect(() => {
    if (isLoaded && user) {
      checkSupabaseConnection();
      checkUserProfile();
    }
  }, [isLoaded, user]);

  const checkSupabaseConnection = async () => {
    try {
      // Test the connection by getting the list of tables
      const { data, error } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');

      if (error) throw error;
      
      setTables(data || []);
      setConnectionStatus('connected');
      setLoading(false);
    } catch (error) {
      console.error('Supabase connection error:', error);
      setConnectionStatus('error');
      setMessage({
        type: 'error',
        text: `Failed to connect to Supabase: ${error.message}`
      });
      setLoading(false);
    }
  };

  const checkUserProfile = async () => {
    if (!user) return;

    try {
      // Check if user profile exists
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setUserCreated(true);
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
      setMessage({
        type: 'error',
        text: `Error checking user profile: ${error.message}`
      });
    }
  };

  const createUserProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Create user profile in Supabase
      const { data, error } = await supabase
        .from('users')
        .insert([
          { 
            clerk_id: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            first_name: user.firstName,
            last_name: user.lastName,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;
      
      setUserCreated(true);
      setMessage({
        type: 'success',
        text: 'User profile created successfully!'
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      setMessage({
        type: 'error',
        text: `Error creating user profile: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const createInitialTables = async () => {
    try {
      setLoading(true);
      
      // Create necessary tables if they don't exist
      const { error: usersError } = await supabase.rpc('create_users_table_if_not_exists');
      if (usersError) throw usersError;
      
      const { error: portfolioError } = await supabase.rpc('create_portfolio_table_if_not_exists');
      if (portfolioError) throw portfolioError;
      
      const { error: tradesError } = await supabase.rpc('create_trades_table_if_not_exists');
      if (tradesError) throw tradesError;
      
      // Refresh table list
      await checkSupabaseConnection();
      
      setMessage({
        type: 'success',
        text: 'Database tables created successfully!'
      });
    } catch (error) {
      console.error('Error creating tables:', error);
      setMessage({
        type: 'error',
        text: `Error creating tables: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-400 dark:border-red-800 p-4 rounded-lg">
          <p className="text-red-700 dark:text-red-300">
            You must be signed in to access the database setup page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      <div className="bg-white dark:bg-polyDark rounded-lg shadow-card p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Database Setup</h1>
        
        {/* Connection Status */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Connection Status</h2>
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full mr-2 ${
              connectionStatus === 'checking' ? 'bg-yellow-400' :
              connectionStatus === 'connected' ? 'bg-green-500' :
              'bg-red-500'
            }`}></div>
            <span className="text-gray-700 dark:text-gray-300">
              {connectionStatus === 'checking' ? 'Checking connection...' :
               connectionStatus === 'connected' ? 'Connected to Supabase' :
               'Connection error'}
            </span>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-400 dark:border-green-800' :
            'bg-red-50 dark:bg-red-900/20 border border-red-400 dark:border-red-800'
          }`}>
            <p className={message.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
              {message.text}
            </p>
          </div>
        )}

        {/* User Profile Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">User Profile</h2>
          
          {userCreated ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-400 dark:border-green-800 p-4 rounded-lg">
              <p className="text-green-700 dark:text-green-300">User profile exists in database</p>
            </div>
          ) : (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-800 p-4 rounded-lg mb-4">
              <p className="text-yellow-700 dark:text-yellow-300 mb-2">No user profile found in database</p>
              <button
                onClick={createUserProfile}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md font-medium disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create User Profile'}
              </button>
            </div>
          )}
        </div>

        {/* Database Tables */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Database Tables</h2>
            <button
              onClick={createInitialTables}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-3 text-sm rounded-md font-medium disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Missing Tables'}
            </button>
          </div>
          
          {loading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-200 dark:bg-polyDark-lighter rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-polyDark-lighter rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-polyDark-lighter rounded w-5/6"></div>
              </div>
            </div>
          ) : tables.length === 0 ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-800 p-4 rounded-lg">
              <p className="text-yellow-700 dark:text-yellow-300">No tables found in database</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-polyDark-lighter rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {tables.map((table, index) => (
                  <li key={index} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                    <span className="text-gray-700 dark:text-gray-300 font-mono">{table.tablename}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseSetup;
