import React from 'react';
import { LinearProblem } from '../types/linearProgramming';

interface ExampleProblemsProps {
  onSelectExample: (example: LinearProblem) => void;
}

const ExampleProblems: React.FC<ExampleProblemsProps> = ({ onSelectExample }) => {
  const examples: LinearProblem[] = [
    {
      objectiveType: 'max',
      objectiveFunction: '3x1 + 5x2',
      constraints: [
        { expression: '2x1 + x2', type: '<=', rhs: '6' },
        { expression: 'x1 + 3x2', type: '<=', rhs: '9' }
      ],
      variables: ['x1', 'x2']
    },
    {
      objectiveType: 'min',
      objectiveFunction: '4x1 + 3x2',
      constraints: [
        { expression: '3x1 + x2', type: '>=', rhs: '3' },
        { expression: '4x1 + 3x2', type: '>=', rhs: '6' },
        { expression: 'x1 + 2x2', type: '>=', rhs: '4' }
      ],
      variables: ['x1', 'x2']
    },
    {
      objectiveType: 'max',
      objectiveFunction: '7x1 + 2x2 + 9x3',
      constraints: [
        { expression: '3x1 - 4x2 + 7x3', type: '<=', rhs: '6' },
        { expression: 'x1 + 3x2 + 2x3', type: '<=', rhs: '8' },
        { expression: '5x1 + 2x2 - 5x3', type: '<=', rhs: '4' }
      ],
      variables: ['x1', 'x2', 'x3']
    }
  ];

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6 space-y-4">
      <h3 className="font-semibold text-gray-800">Problemas de ejemplo</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {examples.map((example, index) => (
          <div 
            key={index}
            className="bg-white border border-gray-200 rounded-md p-3 cursor-pointer hover:border-indigo-500 hover:shadow-sm transition-all duration-200"
            onClick={() => onSelectExample(example)}
          >
            <h4 className="font-medium text-gray-800 mb-2">Ejemplo {index + 1}</h4>
            <div className="text-sm text-gray-600">
              <p>
                <span className="font-medium">{example.objectiveType === 'max' ? 'Maximizar' : 'Minimizar'}</span> {example.objectiveFunction}
              </p>
              <p className="mt-1 font-medium">SA:</p>
              <ul className="pl-4">
                {example.constraints.map((constraint, idx) => (
                  <li key={idx}>
                    {constraint.expression} {constraint.type === '<=' ? '≤' : constraint.type === '>=' ? '≥' : '='} {constraint.rhs}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExampleProblems;