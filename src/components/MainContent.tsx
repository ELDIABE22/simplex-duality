import React, { useState } from 'react';
import ProblemInput from './ProblemInput';
import DualityConverter from './DualityConverter';
import StandardizedForms from './StandardizedForms';
import SimplexTables from './SimplexTables';
import {
  Constraint,
  LinearProblem,
  ModelType,
  SimplexTable,
} from '../types/linearProgramming';
import { convertToDual } from '../utils/duality';
import { standardizePrimal, standardizeDual } from '../utils/standardization';
import { generateSimplexTables } from '../utils/simplex';
import {
  addVariableIndices,
  extractVariables,
  multiplyExpression,
  multiplyRHS,
} from '../utils/formatters';

const MainContent = () => {
  const [problem, setProblem] = useState<LinearProblem | null>(null);
  const [dualProblem, setDualProblem] = useState<LinearProblem | null>(null);
  const [standardPrimal, setStandardPrimal] = useState<LinearProblem | null>(
    null
  );
  const [standardDual, setStandardDual] = useState<LinearProblem | null>(null);
  const [simplexTables, setSimplexTables] = useState<SimplexTable[]>([]);
  const [activeStep, setActiveStep] = useState<number>(0);

  const handleProblemSubmit = (newProblem: LinearProblem) => {
    const primal: LinearProblem = { ...newProblem, modelType: 'PRIMAL' };

    const extractedVariables = extractVariables(
      primal.objectiveFunction,
      primal.constraints
    );
    const unifiedType: '<=' | '>=' =
      primal.objectiveType === 'max' ? '<=' : '>=';

    const finalConstraints: Constraint[] = [];

    primal.constraints.forEach((constraint) => {
      const indexedExpr = addVariableIndices(
        constraint.expression,
        extractedVariables
      );

      if (constraint.type === '=') {
        finalConstraints.push({
          expression: indexedExpr,
          type: unifiedType,
          rhs: constraint.rhs,
        });

        finalConstraints.push({
          expression: multiplyExpression(indexedExpr, -1),
          type: unifiedType,
          rhs: multiplyRHS(constraint.rhs, -1),
        });
      } else if (constraint.type !== unifiedType) {
        finalConstraints.push({
          expression: multiplyExpression(indexedExpr, -1),
          type: unifiedType,
          rhs: multiplyRHS(constraint.rhs, -1),
        });
      } else {
        finalConstraints.push({
          expression: indexedExpr,
          type: constraint.type,
          rhs: constraint.rhs,
        });
      }
    });

    const primalStand: LinearProblem = {
      objectiveType: primal.objectiveType,
      objectiveFunction: primal.objectiveFunction,
      constraints: finalConstraints,
      variables: extractedVariables,
    };

    setProblem(primalStand);

    const stdPrimal = {
      ...standardizePrimal(primal),
      modelType: 'PRIMAL_ESTD' as ModelType,
    };
    setStandardPrimal(stdPrimal);

    const dual = { ...convertToDual(primalStand), modelType: 'DUAL' as ModelType };
    setDualProblem(dual);

    const stdDual = {
      ...standardizeDual(dual),
      modelType: 'DUAL_ESTD' as ModelType,
    };
    setStandardDual(stdDual);

    const tables = generateSimplexTables(stdDual);
    setSimplexTables(tables);

    setActiveStep(1);
  };

  const steps = [
    { id: 0, title: 'Problema', isComplete: problem !== null },
    { id: 1, title: 'Dualidad', isComplete: dualProblem !== null },
    {
      id: 2,
      title: 'Estandarización',
      isComplete: standardPrimal !== null && standardDual !== null,
    },
    { id: 3, title: 'Tablas', isComplete: simplexTables.length > 0 },
  ];

  const goToStep = (step: number) => {
    if (steps[step].isComplete || step <= activeStep) {
      setActiveStep(step);
    }
  };

  return (
    <main className="relative z-20 flex-grow container mx-auto px-4 py-8">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step) => (
            <React.Fragment key={step.id}>
              <div
                className={`flex flex-col items-center cursor-pointer ${
                  step.isComplete
                    ? 'text-indigo-600'
                    : activeStep >= step.id
                    ? 'text-gray-800'
                    : 'text-gray-400'
                }`}
                onClick={() => goToStep(step.id)}
              >
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${
                    step.isComplete
                      ? 'border-indigo-600 bg-indigo-100'
                      : activeStep >= step.id
                      ? 'border-gray-800 bg-white'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <span>{step.id + 1}</span>
                </div>
                <span className="mt-2 text-sm font-medium">{step.title}</span>
              </div>

              {step.id < steps.length - 1 && (
                <div
                  className={`flex-grow h-0.5 ${
                    steps[step.id + 1].isComplete
                      ? 'bg-indigo-600'
                      : activeStep > step.id
                      ? 'bg-gray-800'
                      : 'bg-gray-300'
                  }`}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Active Step Content */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 transition-all duration-300">
        {activeStep === 0 && <ProblemInput onSubmit={handleProblemSubmit} />}

        {activeStep === 1 && problem && dualProblem && (
          <DualityConverter
            primal={problem}
            standardPrimal={standardPrimal!}
            dual={dualProblem}
            onNext={() => setActiveStep(2)}
          />
        )}

        {activeStep === 2 && standardPrimal && standardDual && (
          <StandardizedForms
            dual={dualProblem!}
            standardDual={standardDual}
            onNext={() => setActiveStep(3)}
          />
        )}

        {activeStep === 3 && simplexTables.length > 0 && (
          <SimplexTables tables={simplexTables} />
        )}
      </div>
    </main>
  );
};

export default MainContent;
