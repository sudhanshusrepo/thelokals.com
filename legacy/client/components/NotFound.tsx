
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="text-center py-20 animate-fade-in">
      <div className="text-6xl mb-4">🤷</div>
      <h3 className="text-2xl font-bold dark:text-white">Page Not Found</h3>
      <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">The page you are looking for does not exist.</p>
      <Link to="/" className="px-6 py-3 rounded-lg font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md">
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
