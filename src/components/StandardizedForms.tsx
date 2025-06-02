import React, { useState } from 'react';
import { ArrowRight, HelpCircle } from 'lucide-react';
import { LinearProblem } from '../types/linearProgramming';
import { formatProblem } from '../utils/formatters';

interface StandardizedFormsProps {
  dual: LinearProblem;
  standardDual: LinearProblem;
  onNext: () => void;
}

const StandardizedForms: React.FC<StandardizedFormsProps> = ({
  dual,
  standardDual,
  onNext,
}) => {
  const [showSteps, setShowSteps] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Estandarización del Problema Dual
        </h2>
        <button
          type="button"
          onClick={() => setShowSteps(!showSteps)}
          className="text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center"
        >
          <HelpCircle className="w-5 h-5 mr-1" />
          {showSteps ? 'Ocultar' : 'Mostrar'} Pasos
        </button>
      </div>

      <div className="space-y-8">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-indigo-50 px-4 py-3">
            <h3 className="text-lg font-semibold text-indigo-700">
              Proceso de Estandarización
            </h3>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-100 rounded-md p-4 shadow-sm">
                <h4 className="font-medium text-gray-800 mb-3">
                  Problema Dual Original
                </h4>
                <div
                  className="prose prose-sm"
                  dangerouslySetInnerHTML={{ __html: formatProblem(dual) }}
                />
              </div>

              <div className="bg-white border border-gray-100 rounded-md p-4 shadow-sm">
                <h4 className="font-medium text-gray-800 mb-3">
                  Problema Dual Estandarizado
                </h4>
                <div
                  className="prose prose-sm"
                  dangerouslySetInnerHTML={{
                    __html: formatProblem(standardDual),
                  }}
                />
              </div>
            </div>

            {showSteps && (
              <div className="mt-6 bg-gray-50 border border-gray-100 rounded-md p-4">
                <h4 className="font-medium text-gray-800 mb-3">
                  Reglas de Estandarización:
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-indigo-50">
                        <th className="px-4 py-2 border border-gray-200">
                          Tipo
                        </th>
                        <th className="px-4 py-2 border border-gray-200">
                          Desigualdad
                        </th>
                        <th className="px-4 py-2 border border-gray-200">
                          Estandarizar a
                        </th>
                        <th className="px-4 py-2 border border-gray-200">
                          Contribución de cada variable en la función objetiva
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* MAXIMIZAR */}
                      <tr>
                        <td
                          rowSpan={3}
                          className="px-4 py-2 border border-gray-200 font-semibold"
                        >
                          Maximizar
                        </td>
                        <td className="px-4 py-2 border border-gray-200">
                          &gt;=
                        </td>
                        <td className="px-4 py-2 border border-gray-200">
                          -Si + Ai
                        </td>
                        <td className="px-4 py-2 border border-gray-200">
                          +0Si - MAi 
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border border-gray-200">
                          &lt;=
                        </td>
                        <td className="px-4 py-2 border border-gray-200">
                          +Si
                        </td>
                        <td className="px-4 py-2 border border-gray-200">
                          +0Si 
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border border-gray-200">=</td>
                        <td className="px-4 py-2 border border-gray-200">
                          +Ai
                        </td>
                        <td className="px-4 py-2 border border-gray-200">
                          -MAi 
                        </td>
                      </tr>

                      {/* MINIMIZAR */}
                      <tr>
                        <td
                          rowSpan={3}
                          className="px-4 py-2 border border-gray-200 font-semibold"
                        >
                          Minimizar
                        </td>
                        <td className="px-4 py-2 border border-gray-200">
                          &gt;=
                        </td>
                        <td className="px-4 py-2 border border-gray-200">
                          -Si + Ai
                        </td>
                        <td className="px-4 py-2 border border-gray-200">
                          +0Si + MAi
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border border-gray-200">
                          &lt;=
                        </td>
                        <td className="px-4 py-2 border border-gray-200">
                          +Si
                        </td>
                        <td className="px-4 py-2 border border-gray-200">
                          +0Si
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border border-gray-200">=</td>
                        <td className="px-4 py-2 border border-gray-200">
                          +Ai
                        </td>
                        <td className="px-4 py-2 border border-gray-200">
                          +MAi
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={onNext}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
        >
          Continuar con las Tablas
          <ArrowRight className="w-5 h-5 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default StandardizedForms;
