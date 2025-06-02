import React, { useState } from 'react';
import { ArrowRight, ArrowDown, HelpCircle } from 'lucide-react';
import { Constraint, LinearProblem } from '../types/linearProgramming';
import { formatProblem, formatDualProblem } from '../utils/formatters';

interface DualityConverterProps {
  primal: LinearProblem;
  standardPrimal: LinearProblem;
  dual: LinearProblem;
  onNext: () => void;
}

const DualityConverter: React.FC<DualityConverterProps> = ({
  primal,
  standardPrimal,
  dual,
  onNext,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);

  function haveSameExpressions(a: Constraint[], b: Constraint[]): boolean {
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
      if (a[i].rhs !== b[i].rhs) {
        return false;
      }
    }

    return true;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Conversión de Dualidad
        </h2>
        <button
          type="button"
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center"
        >
          <HelpCircle className="w-5 h-5 mr-1" />
          {showExplanation ? 'Ocultar' : 'Mostrar'} Explicación
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-indigo-700 mb-3">
            Problema Primal
          </h3>
          <div
            className="prose prose-sm"
            dangerouslySetInnerHTML={{ __html: formatProblem(standardPrimal) }}
          />
        </div>

        {!haveSameExpressions(
          primal.constraints,
          standardPrimal.constraints
        ) && (
          <div className="relative">
            <div className="hidden md:block absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2">
              <ArrowRight className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="block md:hidden absolute top-0 left-1/2 transform -translate-y-full -translate-x-1/2">
              <ArrowDown className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-indigo-700 mb-3">
                Problema Primal
              </h3>
              <div
                className="prose prose-sm"
                dangerouslySetInnerHTML={{
                  __html: formatProblem(primal),
                }}
              />
            </div>
          </div>
        )}

        <div className="relative">
          <div className="hidden md:block absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2">
            <ArrowRight className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="block md:hidden absolute top-0 left-1/2 transform -translate-y-full -translate-x-1/2">
            <ArrowDown className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-indigo-700 mb-3">
              Problema Dual
            </h3>
            <div
              className="prose prose-sm"
              dangerouslySetInnerHTML={{ __html: formatDualProblem(dual) }}
            />
          </div>
        </div>
      </div>

      {showExplanation && (
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Cómo Funciona la Dualidad
          </h3>
          <div className="space-y-4 text-gray-700">
            <p>
              La dualidad en programación lineal nos proporciona un problema
              relacionado que ofrece perspectivas complementarias:
            </p>

            <div className="bg-white border border-gray-100 rounded-md p-4">
              <h4 className="font-medium text-gray-800 mb-2">
                Reglas de Transformación:
              </h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  El objetivo del primal (max/min) se convierte en el opuesto en
                  el dual (min/max)
                </li>
                <li>
                  Los coeficientes de las restricciones del primal se convierten
                  en coeficientes del objetivo en el dual
                </li>
                <li>
                  Los coeficientes del objetivo del primal se convierten en
                  coeficientes de las restricciones en el dual
                </li>
                <li>
                  La dirección de las restricciones (≤, =, ≥) determina el signo
                  de las variables duales
                </li>
              </ul>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-indigo-50">
                    <th className="px-4 py-2 border border-gray-200 text-gray-800">
                      Primal
                    </th>
                    <th className="px-4 py-2 border border-gray-200 text-gray-800">
                      Dual
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2 border border-gray-200">
                      Maximizar
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      Minimizar
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border border-gray-200">
                      Minimizar
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      Maximizar
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border border-gray-200">
                      Restricción ≤
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      Variable ≥ 0
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border border-gray-200">
                      Restricción ≥
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      Variable ≤ 0
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border border-gray-200">
                      Restricción =
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      Variable libre
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              <strong>Propiedad importante:</strong> En las soluciones óptimas,
              los valores objetivo del primal y dual son iguales. Esto se conoce
              como el <em>teorema de dualidad fuerte</em>.
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button
          onClick={onNext}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
        >
          Continuar a Estandarización
          <ArrowRight className="w-5 h-5 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default DualityConverter;
