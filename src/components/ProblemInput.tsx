import React, { useState } from 'react';
import { Trash2, Plus, HelpCircle, ArrowRight } from 'lucide-react';
import {
  LinearProblem,
  Constraint,
  ObjectiveType,
} from '../types/linearProgramming';
import ExampleProblems from './ExampleProblems';
import { extractVariables } from '../utils/formatters';

interface ProblemInputProps {
  onSubmit: (problem: LinearProblem) => void;
}

const ProblemInput: React.FC<ProblemInputProps> = ({ onSubmit }) => {
  const [objectiveType, setObjectiveType] = useState<ObjectiveType>('max');
  const [objectiveFunction, setObjectiveFunction] = useState<string>('');
  const [constraints, setConstraints] = useState<Constraint[]>([
    { expression: '', type: '<=', rhs: '' },
  ]);
  const [showHelp, setShowHelp] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  const addConstraint = () => {
    setConstraints([...constraints, { expression: '', type: '<=', rhs: '' }]);
  };

  const removeConstraint = (index: number) => {
    if (constraints.length > 1) {
      const newConstraints = constraints.filter((_, i) => i !== index);
      setConstraints(newConstraints);
    }
  };

  const updateConstraint = (
    index: number,
    field: keyof Constraint,
    value: string
  ) => {
    const newConstraints = [...constraints];
    newConstraints[index] = { ...newConstraints[index], [field]: value };
    setConstraints(newConstraints);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const problem: LinearProblem = {
      objectiveType,
      objectiveFunction,
      constraints,
      variables: extractVariables(objectiveFunction, constraints),
    };

    onSubmit(problem);
  };

  const handleLoadExample = (example: LinearProblem) => {
    setObjectiveType(example.objectiveType);
    setObjectiveFunction(example.objectiveFunction);
    setConstraints(example.constraints);
    setShowExamples(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Entrada del Problema
        </h2>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center"
          >
            <HelpCircle className="w-5 h-5 mr-1" />
            Ayuda
          </button>
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="text-gray-600 hover:text-indigo-600 transition-colors duration-200"
          >
            Ejemplos
          </button>
        </div>
      </div>

      {showHelp && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
          <h3 className="font-semibold text-blue-800 mb-2">
            Cómo ingresar tu problema:
          </h3>
          <ul className="list-disc pl-5 text-blue-700 space-y-1">
            <li>
              Ingresa la función objetivo en la forma:{' '}
              <code className="bg-white px-1 rounded">3x1 + 4x2</code>
            </li>
            <li>
              Para las restricciones, ingresa el lado izquierdo:{' '}
              <code className="bg-white px-1 rounded">2x1 + 5x2</code>
            </li>
            <li>Selecciona el tipo de restricción (≤, =, ≥)</li>
            <li>
              Ingresa el valor del lado derecho:{' '}
              <code className="bg-white px-1 rounded">10</code>
            </li>
            <li>Usa nombres de variables como x1, x2, y, z, etc.</li>
          </ul>
        </div>
      )}

      {showExamples && <ExampleProblems onSelectExample={handleLoadExample} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-28">
              <select
                value={objectiveType}
                onChange={(e) =>
                  setObjectiveType(e.target.value as ObjectiveType)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="max">Maximizar</option>
                <option value="min">Minimizar</option>
              </select>
            </div>
            <div className="flex-grow">
              <input
                type="text"
                value={objectiveFunction}
                onChange={(e) => setObjectiveFunction(e.target.value)}
                placeholder="Ingresa la función objetivo (ej: 3x1 + 4x2)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <h3 className="font-semibold text-gray-700 mt-4">Sujeto a:</h3>

          {constraints.map((constraint, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="flex-grow">
                <input
                  type="text"
                  value={constraint.expression}
                  onChange={(e) =>
                    updateConstraint(index, 'expression', e.target.value)
                  }
                  placeholder="Lado izquierdo (ej: 2x1 + 5x2)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="w-20">
                <select
                  value={constraint.type}
                  onChange={(e) =>
                    updateConstraint(index, 'type', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="<=">≤</option>
                  <option value="=">＝</option>
                  <option value=">=">≥</option>
                </select>
              </div>
              <div className="w-28">
                <input
                  type="text"
                  value={constraint.rhs}
                  onChange={(e) =>
                    updateConstraint(index, 'rhs', e.target.value)
                  }
                  placeholder="Lado derecho"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <button
                type="button"
                onClick={() => removeConstraint(index)}
                className="p-2 text-red-500 hover:text-red-700 transition-colors duration-200"
                title="Eliminar restricción"
                disabled={constraints.length <= 1}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addConstraint}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
          >
            <Plus className="w-5 h-5 mr-1" />
            Agregar Restricción
          </button>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
          >
            Resolver Problema
            <ArrowRight className="w-5 h-5 ml-1" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProblemInput;
