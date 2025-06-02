import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SimplexTable } from '../types/linearProgramming';
import CellExplanation from './CellExplanation';

interface SimplexTablesProps {
  tables: SimplexTable[];
}

const SimplexTables: React.FC<SimplexTablesProps> = ({ tables }) => {
  const [currentTableIndex, setCurrentTableIndex] = useState(0);
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
    value: number;
    explanation: string;
  } | null>(null);

  const currentTable = tables[currentTableIndex];

  const handleNextTable = () => {
    if (currentTableIndex < tables.length - 1) {
      setCurrentTableIndex(currentTableIndex + 1);
      setSelectedCell(null);
    }
  };

  const handlePrevTable = () => {
    if (currentTableIndex > 0) {
      setCurrentTableIndex(currentTableIndex - 1);
      setSelectedCell(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Tablas</h2>
        <p className="text-xl font-bold">M = 100</p>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">
            Tabla {currentTableIndex + 1} de {tables.length}
          </span>
          <button
            onClick={handlePrevTable}
            disabled={currentTableIndex === 0}
            className={`p-1 rounded-full ${
              currentTableIndex === 0
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextTable}
            disabled={currentTableIndex === tables.length - 1}
            className={`p-1 rounded-full ${
              currentTableIndex === tables.length - 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Leyenda explicativa de colores */}
      <div className="mb-4 border border-gray-300 rounded p-4 bg-gray-50">
        <h3 className="font-semibold mb-2 text-gray-700">
          Leyenda de colores:
        </h3>
        <div className="flex flex-wrap gap-4 text-sm text-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-yellow-400 rounded flex items-center justify-center font-bold text-black select-none"></div>
            <span>Valores pivotes</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-500 rounded"></div>
            <span>Valores que cumplen</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-500 rounded"></div>
            <span>Valores que no cumplen</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-black/80 rounded"></div>
            <span>Celdas sin valor (no aplicables)</span>
          </div>
        </div>
      </div>

      <div className="relative">
        {currentTable && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-indigo-700">
                {currentTableIndex === 0
                  ? 'Tabla Simplex Inicial'
                  : `Iteración ${currentTableIndex}`}
              </h3>
              <div className="text-sm text-gray-600">
                {currentTableIndex > 0 && (
                  <span>
                    Pivote tabla anterior: (
                    {tables[currentTableIndex - 1].pivotRow},{' '}
                    {tables[currentTableIndex - 1].pivotCol})
                  </span>
                )}
              </div>
            </div>

            <table className="min-w-full border-collapse text-center">
              <thead>
                <tr>
                  <th className="w-16"></th>
                  <th className="w-16"></th>
                  <th className="px-4 py-2 border border-gray-200 text-gray-800 w-16">
                    Cj
                  </th>
                  {currentTable.cj.map((cj, index) => (
                    <th
                      key={index}
                      className="px-4 py-2 border border-gray-200 text-gray-500 w-16"
                    >
                      {cj}
                    </th>
                  ))}
                  <th className="w-16"></th>
                </tr>
                <tr>
                  <th className="px-4 py-2 border border-gray-200 text-gray-800 w-16">
                    Ci
                  </th>
                  <th className="px-4 py-2 border border-gray-200 text-gray-800 w-16">
                    Vb
                  </th>
                  <th className="px-4 py-2 border border-gray-200 text-gray-800 w-16">
                    Bi
                  </th>
                  {currentTable.variables.map((variables) => (
                    <th
                      key={variables}
                      className="px-4 py-2 border border-gray-200 text-gray-500 w-16"
                    >
                      {variables}
                    </th>
                  ))}
                  <th className="px-4 py-2 border border-gray-200 text-gray-800 w-16">
                    ∅i
                  </th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const oiArray = currentTable.oi ?? [];
                  const positiveOi = oiArray.filter(
                    (v): v is number => v !== null && v > 0
                  );
                  const minPositiveOi =
                    positiveOi.length > 0 ? Math.min(...positiveOi) : null;
                  const minPositiveIndex = oiArray.indexOf(minPositiveOi);

                  return currentTable.matrix.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className="px-4 py-2 border border-gray-200 text-gray-500 w-16">
                        {currentTable.ciAndBi.values[rowIndex]}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-gray-500 w-16">
                        {currentTable.ciAndBi.variables[rowIndex]}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-gray-500 w-16 font-medium">
                        {currentTable.bi[rowIndex]}
                      </td>
                      {row.map((item, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-4 py-2 border border-gray-200 text-gray-500 w-16"
                        >
                          {item}
                        </td>
                      ))}
                      <td className="px-4 py-2 border border-gray-200 text-gray-500 w-16">
                        <div>{currentTable.oi?.[rowIndex]}</div>
                        {rowIndex === minPositiveIndex && (
                          <div
                            className="bg-yellow-400 text-black font-bold text-xs mt-1 px-1 rounded text-center select-none"
                            style={{ lineHeight: 1 }}
                          >
                            ✓
                          </div>
                        )}
                      </td>
                    </tr>
                  ));
                })()}
                <tr>
                  <td></td>
                  <td className="font-bold px-4 py-2 border border-gray-200 text-gray-800 w-16">
                    Zj
                  </td>
                  {currentTable.zj.map((zj, index) => (
                    <td
                      key={index}
                      className="px-4 py-2 border border-gray-200 text-gray-500 w-16"
                    >
                      {zj}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td></td>
                  <td className="font-bold px-4 py-2 border border-gray-200 text-gray-800 w-16">
                    Cj - Zj
                  </td>
                  <td className="px-4 py-2 border border-gray-200 text-gray-800 w-16 bg-black/80"></td>
                  {currentTable.evaluatedCjMinusZj === null
                    ? currentTable.cjMinusZj.map((cjMinusZj, index) => (
                        <td
                          key={index}
                          className="px-4 py-2 border border-gray-200 text-gray-500 w-16"
                        >
                          <div>{cjMinusZj}</div>
                          <div
                            className="bg-green-500 text-white text-xs mt-1 px-1 rounded text-center"
                            style={{ lineHeight: 1 }}
                          >
                            ✓
                          </div>
                        </td>
                      ))
                    : currentTable.cjMinusZj.map((cjMinusZj, index) => {
                        const value = currentTable.evaluatedCjMinusZj?.[index];

                        // Encontrar el índice del valor más violador (mínimo para min, máximo para max)
                        const validValues = (
                          currentTable.evaluatedCjMinusZj || []
                        ).filter((v) => v !== undefined && !isNaN(v));
                        const mostViolatingValue =
                          currentTable.objectiveType === 'min'
                            ? Math.min(...validValues)
                            : Math.max(...validValues);
                        const isMostViolating =
                          value !== undefined &&
                          !isNaN(value) &&
                          value === mostViolatingValue &&
                          (currentTable.objectiveType === 'min'
                            ? value < 0
                            : value > 0);

                        // Verificar si hay violaciones
                        const hasViolations =
                          validValues.length > 0 &&
                          validValues.some((v) =>
                            currentTable.objectiveType === 'min' ? v < 0 : v > 0
                          );

                        // Determinar el color de fondo
                        let bgColorClass =
                          value !== undefined && !isNaN(value)
                            ? value < 0
                              ? 'bg-red-500'
                              : 'bg-green-500'
                            : 'bg-gray-500';
                        if (hasViolations && isMostViolating) {
                          bgColorClass = 'bg-yellow-400 text-black font-bold';
                        }

                        return (
                          <td
                            key={index}
                            className="px-4 py-2 border border-gray-200 text-gray-500 max-w-16"
                          >
                            <div>{cjMinusZj}</div>
                            {value !== undefined && !isNaN(value) && (
                              <div
                                className={`text-white text-xs mt-1 px-1 rounded ${bgColorClass} text-center`}
                                style={{ lineHeight: 1 }}
                              >
                                {Number.isInteger(value)
                                  ? value
                                  : value.toFixed(2)}
                              </div>
                            )}
                          </td>
                        );
                      })}
                </tr>
              </tbody>
            </table>

            {currentTable.violationExpressions !== null &&
              currentTable.oi !== null && (
                <div className="mt-4 flex justify-between items-center text-sm text-gray-700">
                  <div>
                    {currentTableIndex < tables.length - 1 && (
                      <p>
                        <strong>Variable que ingresa:</strong>{' '}
                        {currentTable.enteringVariable?.cj}
                        {currentTable.enteringVariable?.variable}
                      </p>
                    )}
                    {currentTableIndex < tables.length - 1 && (
                      <p>
                        <strong>Variable que sale:</strong>{' '}
                        {currentTable.leavingVariable?.ci}
                        {currentTable.leavingVariable?.vb}
                      </p>
                    )}
                  </div>

                  {currentTableIndex < tables.length - 1 && (
                    <button
                      onClick={handleNextTable}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
                    >
                      Próxima iteración
                    </button>
                  )}
                </div>
              )}

            {currentTableIndex === tables.length - 1 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
                <p className="font-medium">¡Solución óptima encontrada!</p>
              </div>
            )}
          </div>
        )}

        {selectedCell && (
          <CellExplanation
            cell={selectedCell}
            onClose={() => setSelectedCell(null)}
          />
        )}
      </div>
    </div>
  );
};

export default SimplexTables;
