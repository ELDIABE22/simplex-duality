import React from 'react';
import { X } from 'lucide-react';

interface CellExplanationProps {
  cell: {
    row: number;
    col: number;
    value: number | string;
    explanation: string;
  };
  onClose: () => void;
}

const CellExplanation: React.FC<CellExplanationProps> = ({ cell, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50\" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 animate-fade-in" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-800">Explicación del valor de la celda</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-4">
          <div className="flex items-center justify-center p-4 mb-4 bg-gray-50 rounded-md">
            <span className="text-2xl font-medium text-indigo-700">
              {typeof cell.value === 'number' ? cell.value.toFixed(2) : cell.value}
            </span>
          </div>
          <p className="text-gray-700">{cell.explanation}</p>
        </div>
        <div className="flex justify-end bg-gray-50 px-6 py-3 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CellExplanation;