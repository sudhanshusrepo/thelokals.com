
import React from 'react';

interface NoDataProps {
  message: string;
}

const NoData: React.FC<NoDataProps> = ({ message }) => {
  return (
    <div className="text-center py-20 animate-fade-in">
      <div className="text-6xl mb-4">🤷</div>
      <h3 className="text-2xl font-bold dark:text-white">No Results Found</h3>
      <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">{message}</p>
    </div>
  );
};

export default NoData;
