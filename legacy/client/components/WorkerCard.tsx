import React from 'react';
import { Helmet } from 'react-helmet-async';
import { WorkerProfile, WorkerStatus } from '../../core/types';
import { ICONS } from '../constants';
import { ProviderStructuredData } from './StructuredData';

interface WorkerCardProps {
  worker: WorkerProfile;
  distanceKm?: number;
  onConnect: (worker: WorkerProfile) => void;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({ worker, distanceKm, onConnect }) => {

  const getStatusColor = (status: WorkerStatus) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-500 border-green-200 dark:border-green-900';
      case 'BUSY': return 'bg-amber-500 border-amber-200 dark:border-amber-900';
      case 'OFFLINE': return 'bg-gray-400 border-gray-200 dark:border-gray-600';
      default: return 'bg-gray-400 border-gray-200';
    }
  };

  const getButtonText = (status: WorkerStatus) => {
    switch (status) {
      case 'AVAILABLE': return 'Connect Now';
      case 'BUSY': return 'Book for Later';
      case 'OFFLINE': return 'Message';
    }
  };

  const isAvailable = worker.status === 'AVAILABLE';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md dark:shadow-none border border-gray-100 dark:border-gray-700 transition-all duration-300 overflow-hidden flex flex-col group">
      <Helmet>
        <title>{worker.name} - {worker.category} | thelokals.com</title>
        <meta name="description" content={worker.description} />
      </Helmet>
      <ProviderStructuredData name={worker.name} jobTitle={worker.category} url={`https://thelokals.com/providers/${worker.id}`} />
      <div className="p-4 flex gap-4">
        <div className="relative flex-shrink-0">
          <div className="relative">
            <img
              src={worker.imageUrl}
              alt={worker.name}
              className={`w-20 h-20 rounded-xl object-cover bg-gray-200 dark:bg-gray-700 ${!isAvailable ? 'grayscale-[0.3]' : ''}`}
            />
            {/* Availability Badge */}
            <div className="absolute -top-2 -left-2 z-10">
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm border ${getStatusColor(worker.status)}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                {worker.status}
              </span>
            </div>
          </div>

          {worker.isVerified && (
            <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1 rounded-full border-2 border-white dark:border-gray-800 shadow-sm z-10" title="Verified Pro">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{worker.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{worker.category}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                ${worker.price}
                <span className="text-xs font-normal text-gray-400">/{worker.priceUnit}</span>
              </span>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-3 text-sm">
            <div className="flex items-center text-yellow-500 font-bold gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-0.5 rounded-md">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d={ICONS.STAR} />
              </svg>
              {worker.rating}
            </div>
            {distanceKm !== undefined && (
              <div className="flex items-center text-gray-500 dark:text-gray-400 gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={ICONS.LOCATION} />
                </svg>
                <span>{distanceKm.toFixed(1)} km</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-2">
        <div className="flex flex-wrap gap-2 mb-3">
          {worker.expertise.slice(0, 3).map((skill, i) => (
            <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md">
              {skill}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
          {worker.description}
        </p>
      </div>

      <div className="mt-auto border-t border-gray-100 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
        <button
          onClick={() => onConnect(worker)}
          className={`w-full font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-[0.98]
            ${isAvailable
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : (worker.status === 'BUSY' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-500 dark:hover:bg-amber-900/50' : 'bg-gray-200 text-gray-500 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600')
            }
          `}
        >
          {getButtonText(worker.status)}
        </button>
      </div>
    </div>
  );
};