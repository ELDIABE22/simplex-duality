import { LinearProblem, SimplexTable } from '../types/linearProgramming';
import {
  analyzeObjectiveFunction,
  evaluateExpression,
  formatCjMinusZj,
  formatZjExpression,
  negateExpression,
  parseExpression,
} from './parser';

/**
 * Generates all simplex tables for solving the given linear programming problem
 */
export function generateSimplexTables(problem: LinearProblem): SimplexTable[] {
  // For demonstration purposes, we'll create some sample tables
  // In a real implementation, this would perform the actual simplex algorithm

  const tables: SimplexTable[] = [];

  // Extract variables and basic variables
  const variables = [...problem.variables];

  // Create the initial tableau
  let currentTable = createInitialTable(problem, variables);
  tables.push(currentTable);

  // Bucle de iteraciones mientras cj - zj tenga violaciones
  while (currentTable.evaluatedCjMinusZj !== null) {
    const enteringVar = currentTable.enteringVariable;
    const leavingVar = currentTable.leavingVariable;

    if (!enteringVar || !leavingVar) break; // No hay más iteraciones válidas

    const pivotCol = currentTable.variables.indexOf(enteringVar.variable);
    const pivotRow = currentTable.ciAndBi.variables.indexOf(leavingVar.vb);

    const nextTable = performIteration(currentTable, pivotRow, pivotCol);
    tables.push(nextTable);

    currentTable = nextTable;
  }

  return tables;
}

function createInitialTable(
  problem: LinearProblem,
  variables: string[]
): SimplexTable {
  const cj: (number | string)[] = [];
  const bi: number[] = [];
  const zj: string[] = [];
  const cjMinusZj: string[] = [];

  const symbolicTerms: Record<string, number> = {};
  const matrix: (number | string)[][] = [];

  const objectiveCoeffs = parseExpression(problem.objectiveFunction);
  variables.forEach((variable) => {
    cj.push(objectiveCoeffs[variable] || 0);
  });

  problem.constraints.map((c) => {
    bi.push(parseInt(c.rhs));
  });

  problem.constraints.forEach((constraint) => {
    const row: (number | string)[] = [];
    const constraintCoeffs = parseExpression(constraint.expression);
    variables.forEach((variable) => {
      row.push(constraintCoeffs[variable] || 0);
    });
    matrix.push(row);
  });

  const ciAndBi = analyzeObjectiveFunction(problem.objectiveFunction);

  ciAndBi.variables.forEach((varName, index) => {
    const ci = ciAndBi.values[index];
    const rowIndex = variables.indexOf(varName);
    if (rowIndex !== -1) {
      const biValue = bi[rowIndex];
      if (typeof ci === 'string') {
        symbolicTerms[ci] = (symbolicTerms[ci] || 0) + biValue;
      }
    }
  });

  for (let col = 0; col < matrix[0].length; col++) {
    const symbolicColTerms: Record<string, number> = {};
    let numericColSum = 0;

    for (let row = 0; row < ciAndBi.values.length; row++) {
      const ci = ciAndBi.values[row];
      const value = Number(matrix[row][col]);

      if (typeof ci === 'string') {
        symbolicColTerms[ci] = (symbolicColTerms[ci] || 0) + value;
      } else if (typeof ci === 'number') {
        numericColSum += ci * value;
      }
    }

    const simplifiedSymbolic = Object.entries(symbolicColTerms)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, coeff]) => coeff !== 0) // ⬅️ Agrega esto para eliminar coeficientes 0
      .map(([symbol, coeff]) => {
        if (coeff === 1) return symbol;
        if (coeff === -1) return `-${symbol}`;
        return `${coeff}${symbol}`;
      });

    const simplifiedExpression = [
      numericColSum !== 0
        ? Number.isInteger(numericColSum)
          ? numericColSum.toString()
          : numericColSum.toFixed(2)
        : null,
      ...simplifiedSymbolic,
    ]
      .filter(Boolean)
      .join(' + ')
      .replace(/\+ -/g, '- ');

    zj.push(formatZjExpression(simplifiedExpression || '0'));
  }

  let numericCiBiSum = 0;

  ciAndBi.values.forEach((ci, i) => {
    const biValue = bi[i];
    if (typeof ci === 'string') {
      symbolicTerms[ci] = (symbolicTerms[ci] || 0) + biValue;
    } else {
      numericCiBiSum += ci * biValue;
    }
  });

  const ciBiSimplified = [
    numericCiBiSum !== 0
      ? Number.isInteger(numericCiBiSum)
        ? numericCiBiSum.toString()
        : numericCiBiSum.toFixed(2)
      : null,
    ...Object.entries(symbolicTerms)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, coeff]) => coeff !== 0)
      .map(([symbol, coeff]) => {
        if (coeff === 1) return symbol;
        if (coeff === -1) return `-${symbol}`;
        return `${coeff}${symbol}`;
      }),
  ]
    .filter(Boolean)
    .join(' + ')
    .replace(/\+ -/g, '- ');

  zj.unshift(formatZjExpression(ciBiSimplified || '0'));

  // 🔽 Calculamos cj - zj
  for (let i = 0; i < variables.length; i++) {
    const cjVal = cj[i];
    const zjExpr = zj[i + 1];
    const cjStr = typeof cjVal === 'number' ? cjVal.toString() : cjVal;

    if (zjExpr === '0') {
      cjMinusZj.push(cjStr);
    } else if (cjStr === '0') {
      cjMinusZj.push(negateExpression(zjExpr));
    } else if (cjStr === 'M' && zjExpr === 'M') {
      cjMinusZj.push('0');
    } else {
      cjMinusZj.push(formatCjMinusZj(cjStr, zjExpr));
    }
  }

  // 🔍 Verificar cj - zj con M = 100
  const evaluatedCjMinusZj = cjMinusZj.map(evaluateExpression);

  const violatingTerms: { original: string; value: number }[] = [];

  for (let i = 0; i < evaluatedCjMinusZj.length; i++) {
    const val = evaluatedCjMinusZj[i];
    const expr = cjMinusZj[i];

    if (
      (problem.objectiveType === 'max' && val > 0) ||
      (problem.objectiveType === 'min' && val < 0)
    ) {
      violatingTerms.push({ original: expr, value: val });
    }
  }

  // ➕ NUEVO: estos tres arrays
  const violationExpressions = violatingTerms.map((v) => v.original);

  // 🔽 Calculamos OI si no cumple
  let oi: (number | null)[] | null = null;

  const shouldContinue =
    problem.objectiveType === 'max'
      ? evaluatedCjMinusZj?.some((v) => v > 0)
      : evaluatedCjMinusZj?.some((v) => v < 0);

  if (shouldContinue && evaluatedCjMinusZj) {
    const mostViolatingValue =
      problem.objectiveType === 'max'
        ? Math.max(...evaluatedCjMinusZj)
        : Math.min(...evaluatedCjMinusZj);

    const mostViolatingIndex = evaluatedCjMinusZj.findIndex(
      (v) => v === mostViolatingValue
    );

    const pivotColumn = mostViolatingIndex;
    const columnValues = matrix.map((row) => Number(row[pivotColumn]));

    oi = bi.map((b, i) => {
      const denominator = columnValues[i];
      if (denominator === 0) return null;
      return b / denominator;
    });
  }

  const minPositiveOiRaw = oi
    ?.filter((val): val is number => typeof val === 'number' && val > 0)
    .reduce((min, val) => (val < min ? val : min), Infinity);

  const minPositiveOi =
    typeof minPositiveOiRaw === 'number' && !Number.isInteger(minPositiveOiRaw)
      ? Number(minPositiveOiRaw.toFixed(2))
      : minPositiveOiRaw;

  let mostNegativeCjMinusZj: string | undefined;

  if (evaluatedCjMinusZj && evaluatedCjMinusZj.length > 0) {
    let mostNegativeIndex: number | null = null;
    let mostNegativeValue: number | null = null;
    mostNegativeValue = Math.min(...evaluatedCjMinusZj);
    mostNegativeIndex = evaluatedCjMinusZj.findIndex(
      (v) => v === mostNegativeValue
    );
    mostNegativeCjMinusZj =
      mostNegativeIndex !== -1 ? cjMinusZj[mostNegativeIndex] : undefined;
  }

  let enteringVariable: { cj: string | number; variable: string } | undefined =
    undefined;
  let leavingVariable: { ci: string | number; vb: string } | undefined =
    undefined;

  if (shouldContinue && evaluatedCjMinusZj) {
    // 1. Encontramos índice del cj - zj más violador (positivo en max, negativo en min)
    const mostViolatingValue =
      problem.objectiveType === 'max'
        ? Math.max(...evaluatedCjMinusZj)
        : Math.min(...evaluatedCjMinusZj);

    const mostViolatingIndex = evaluatedCjMinusZj.findIndex(
      (v) => v === mostViolatingValue
    );

    // Asignamos variable que entra
    enteringVariable = {
      cj: cj[mostViolatingIndex],
      variable: variables[mostViolatingIndex],
    };

    // 2. Encontramos índice del menor Oi positivo (leaving variable)
    const validOi = oi
      ?.map((val, index) => ({ val, index }))
      .filter(
        (item): item is { val: number; index: number } =>
          typeof item.val === 'number' && item.val > 0
      );

    if (validOi && validOi.length > 0) {
      const minOi = validOi.reduce((min, current) =>
        current.val < min.val ? current : min
      );

      leavingVariable = {
        ci: ciAndBi.values[minOi.index],
        vb: ciAndBi.variables[minOi.index], // <-- Aquí corregido
      };
    }
  }

  const initialTable: SimplexTable = {
    cj,
    bi,
    ciAndBi,
    variables,
    matrix,
    zj,
    cjMinusZj,
    oi: oi?.map((val) =>
      typeof val === 'number' ? Number(val.toFixed(2)) : val
    ),
    evaluatedCjMinusZj: violatingTerms.length === 0 ? null : evaluatedCjMinusZj,
    violationExpressions:
      violatingTerms.length === 0 ? null : violationExpressions,
    objectiveType: problem.objectiveType,
    enteringVariable,
    leavingVariable,
    pivotRow: mostNegativeCjMinusZj,
    pivotCol: minPositiveOi,
  };

  return initialTable;
}

/**
 * Performs a simplex iteration and creates the next table
 */
function performIteration(
  currentTable: SimplexTable,
  pivotRow: number,
  pivotCol: number
): SimplexTable {
  const {
    cj,
    bi: oldBi,
    matrix: oldMatrix,
    ciAndBi: oldCiAndBi,
    variables,
  } = currentTable;

  const numRows = oldMatrix.length;
  const numCols = oldMatrix[0].length;

  const pivotElement = Number(oldMatrix[pivotRow][pivotCol]);

  const newMatrix: (number | string)[][] = [];
  const newBi: number[] = [];
  const newCiAndBi = {
    variables: [...oldCiAndBi.variables],
    values: [...oldCiAndBi.values],
  };

  // Actualizamos variable básica
  const enteringVar = variables[pivotCol];
  newCiAndBi.variables[pivotRow] = enteringVar;
  newCiAndBi.values[pivotRow] = cj[pivotCol];

  // Fila pivote
  const newPivotRow = oldMatrix[pivotRow].map(
    (val) => Number(val) / pivotElement
  );
  const newPivotBi = oldBi[pivotRow] / pivotElement;

  newMatrix[pivotRow] = newPivotRow;
  newBi[pivotRow] = newPivotBi;

  // Otras filas
  for (let i = 0; i < numRows; i++) {
    if (i === pivotRow) continue;

    const row = oldMatrix[i];
    const biVal = oldBi[i];
    const factor = Number(row[pivotCol]);

    const newRow = row.map(
      (val, j) => Number(val) - factor * Number(newMatrix[pivotRow][j])
    );
    const newBiVal = biVal - factor * newBi[pivotRow];

    newMatrix[i] = newRow;
    newBi[i] = newBiVal;
  }

  // Calcular Zj
  const zj: string[] = [];
  const symbolicTerms: Record<string, number> = {};

  for (let col = 0; col < numCols; col++) {
    const symbolicColTerms: Record<string, number> = {};
    let numericColSum = 0;

    for (let row = 0; row < numRows; row++) {
      const ci = newCiAndBi.values[row];
      const value = Number(newMatrix[row][col]);

      if (typeof ci === 'string') {
        symbolicColTerms[ci] = (symbolicColTerms[ci] || 0) + value;
      } else {
        numericColSum += ci * value;
      }
    }

    const simplifiedSymbolic = Object.entries(symbolicColTerms)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, coeff]) => coeff !== 0) // ⬅️ Agrega esto para eliminar coeficientes 0
      .map(([symbol, coeff]) => {
        if (coeff === 1) return symbol;
        if (coeff === -1) return `-${symbol}`;
        return `${coeff}${symbol}`;
      });

    const simplifiedExpression = [
      numericColSum !== 0
        ? Number.isInteger(numericColSum)
          ? numericColSum.toString()
          : numericColSum.toFixed(2)
        : null,
      ...simplifiedSymbolic,
    ]
      .filter(Boolean)
      .join(' + ')
      .replace(/\+ -/g, '- ');

    zj.push(formatZjExpression(simplifiedExpression || '0'));
  }

  let numericCiBiSum = 0;

  // Agregamos Z (zj[0])
  for (let i = 0; i < numRows; i++) {
    const ci = newCiAndBi.values[i];
    const biVal = newBi[i];

    if (typeof ci === 'string') {
      symbolicTerms[ci] = (symbolicTerms[ci] || 0) + biVal;
    } else {
      numericCiBiSum += ci * biVal;
    }
  }

  const ciBiSimplified = [
    numericCiBiSum !== 0
      ? Number.isInteger(numericCiBiSum)
        ? numericCiBiSum.toString()
        : numericCiBiSum.toFixed(2)
      : null,
    ...Object.entries(symbolicTerms)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, coeff]) => coeff !== 0)
      .map(([symbol, coeff]) => {
        if (coeff === 1) return symbol;
        if (coeff === -1) return `-${symbol}`;
        return `${coeff}${symbol}`;
      }),
  ]
    .filter(Boolean)
    .join(' + ')
    .replace(/\+ -/g, '- ');

  zj.unshift(formatZjExpression(ciBiSimplified || '0'));

  // Calcular cj - zj
  const cjMinusZj: string[] = [];

  for (let i = 0; i < variables.length; i++) {
    const cjVal = cj[i];
    const zjExpr = zj[i + 1];
    const cjStr = typeof cjVal === 'number' ? cjVal.toString() : cjVal;

    if (zjExpr === '0') {
      cjMinusZj.push(cjStr);
    } else if (cjStr === '0') {
      cjMinusZj.push(negateExpression(zjExpr));
    } else if (cjStr === 'M' && zjExpr === 'M') {
      cjMinusZj.push('0');
    } else {
      cjMinusZj.push(formatCjMinusZj(cjStr, zjExpr));
    }
  }

  const evaluatedCjMinusZj = cjMinusZj.map(evaluateExpression);

  const violatingTerms: { original: string; value: number }[] = [];

  for (let i = 0; i < evaluatedCjMinusZj.length; i++) {
    const val = evaluatedCjMinusZj[i];
    const expr = cjMinusZj[i];

    if (
      (currentTable.objectiveType === 'max' && val > 0) ||
      (currentTable.objectiveType === 'min' && val < 0)
    ) {
      violatingTerms.push({ original: expr, value: val });
    }
  }

  // const violationExpressions = violatingTerms.map((v) => v.original);

  // Calcular OI
  let oi: (number | null)[] | null = null;
  const shouldContinue =
    currentTable.objectiveType === 'max'
      ? evaluatedCjMinusZj?.some((v) => v > 0)
      : evaluatedCjMinusZj?.some((v) => v < 0);

  if (shouldContinue && evaluatedCjMinusZj) {
    const mostViolatingValue =
      currentTable.objectiveType === 'max'
        ? Math.max(...evaluatedCjMinusZj)
        : Math.min(...evaluatedCjMinusZj);

    const mostViolatingIndex = evaluatedCjMinusZj.findIndex(
      (v) => v === mostViolatingValue
    );

    const pivotColumn = mostViolatingIndex;
    const columnValues = newMatrix.map((row) => Number(row[pivotColumn]));

    oi = newBi.map((b, i) => {
      const denominator = columnValues[i];
      if (denominator === 0) return null;
      return b / denominator;
    });
  }

  const minPositiveOiRaw = oi
    ?.filter((val): val is number => typeof val === 'number' && val > 0)
    .reduce((min, val) => (val < min ? val : min), Infinity);

  const minPositiveOi =
    typeof minPositiveOiRaw === 'number' && !Number.isInteger(minPositiveOiRaw)
      ? Number(minPositiveOiRaw.toFixed(2))
      : minPositiveOiRaw;

  let mostNegativeCjMinusZj: string | undefined;

  if (evaluatedCjMinusZj && evaluatedCjMinusZj.length > 0) {
    let mostNegativeIndex: number | null = null;
    let mostNegativeValue: number | null = null;
    mostNegativeValue = Math.min(...evaluatedCjMinusZj);
    mostNegativeIndex = evaluatedCjMinusZj.findIndex(
      (v) => v === mostNegativeValue
    );
    mostNegativeCjMinusZj =
      mostNegativeIndex !== -1 ? cjMinusZj[mostNegativeIndex] : undefined;
  }

  let enteringVariable: { cj: string | number; variable: string } | undefined =
    undefined;
  let leavingVariable: { ci: string | number; vb: string } | undefined =
    undefined;

  if (shouldContinue && evaluatedCjMinusZj) {
    const mostViolatingValue =
      currentTable.objectiveType === 'max'
        ? Math.max(...evaluatedCjMinusZj)
        : Math.min(...evaluatedCjMinusZj);

    const mostViolatingIndex = evaluatedCjMinusZj.findIndex(
      (v) => v === mostViolatingValue
    );

    enteringVariable = {
      cj: cj[mostViolatingIndex],
      variable: variables[mostViolatingIndex],
    };

    const validOi = oi
      ?.map((val, index) => ({ val, index }))
      .filter(
        (item): item is { val: number; index: number } =>
          typeof item.val === 'number' && item.val > 0
      );

    if (validOi && validOi.length > 0) {
      const minOi = validOi.reduce((min, current) =>
        current.val < min.val ? current : min
      );

      leavingVariable = {
        ci: newCiAndBi.values[minOi.index],
        vb: newCiAndBi.variables[minOi.index],
      };
    }
  }

  return {
    cj,
    bi: newBi.map((val) => Number(val.toFixed(2))),
    ciAndBi: newCiAndBi,
    variables,
    matrix: newMatrix.map((row) =>
      row.map((val) => (typeof val === 'number' ? Number(val.toFixed(2)) : val))
    ),
    zj,
    cjMinusZj,
    oi: oi?.map((val) =>
      typeof val === 'number' ? Number(val.toFixed(2)) : val
    ),
    evaluatedCjMinusZj: violatingTerms.length === 0 ? null : evaluatedCjMinusZj,
    enteringVariable,
    leavingVariable,
    objectiveType: currentTable.objectiveType,
    pivotCol: minPositiveOi,
    pivotRow: mostNegativeCjMinusZj,
  };
}

/**
 * Creates the final optimal table with improved values
 */
// function createFinalTable(table: SimplexTable): SimplexTable {
//   // Create a slightly improved final table
//   const finalTable: SimplexTable = {
//     cj: [...table.cj],
//     bi: [...table.bi],
//     matrix: JSON.parse(JSON.stringify(table.matrix))
//   };

//   // Update the objective value (last element in Z row)
//   finalTable.matrix[0][finalTable.matrix[0].length - 1] += 2.5;

//   return finalTable;
// }
