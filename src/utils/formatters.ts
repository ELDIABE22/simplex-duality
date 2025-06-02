import { Constraint, LinearProblem } from '../types/linearProgramming';

/**
 * Formats a linear programming problem as HTML
 */
export function formatProblem(problem: LinearProblem): string {
  const objectiveTypeStr =
    problem.objectiveType === 'max' ? 'Maximizar' : 'Minimizar';

  let html = `<div class="mb-2"><strong>${objectiveTypeStr}</strong> Z = ${formatExpression(
    problem.objectiveFunction
  )}</div>`;

  html += '<div><strong>SA:</strong></div>';
  html += '<ul class="list-none pl-4 space-y-1">';

  problem.constraints.forEach((constraint) => {
    const typeSymbol =
      constraint.type === '<=' ? '≤' : constraint.type === '>=' ? '≥' : '=';
    html += `<li>${formatExpression(constraint.expression)} ${typeSymbol} ${
      constraint.rhs
    }</li>`;
  });

  html += '</ul>';

  // Add non-negativity constraints if there are variables
  if (problem.variables && problem.variables.length > 0) {
    html += '<div class="mt-2"><strong>No negatividad:</strong></div>';
    html += '<ul class="list-none pl-4">';
    problem.variables.forEach((variable) => {
      html += `<li>${variable} ≥ 0</li>`;
    });
    html += '</ul>';
  }

  return html;
}

/**
 * Formats a dual linear programming problem as HTML
 */
export function formatDualProblem(problem: LinearProblem): string {
  return formatProblem(problem);
}

/**
 * Formats a linear expression with proper spacing and variables
 */
function formatExpression(expression: string): string {
  // Replace simple patterns for better display
  return expression
    .replace(/\+\s*-/g, '- ')
    .replace(/\+/g, ' + ')
    .replace(/- /g, ' - ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Agrega índices a las variables de la expresión (x -> x1, x -> x2, ...)
export function addVariableIndices(
  expression: string,
  variables: string[]
): string {
  return (
    expression
      .replace(/\s+/g, '')
      .match(/[+-]?\d*[a-zA-Z]+/g)
      ?.map((term, index) => {
        const match = term.match(/^([+-]?)(\d*)([a-zA-Z]+)/);
        if (!match) return term;
        const [, sign, coefStr, variable] = match;
        const coef =
          (sign === '-' ? -1 : 1) * (coefStr === '' ? 1 : parseInt(coefStr));
        const indexedVar = variables[index] || `${variable}${index + 1}`;
        return `${coef >= 0 ? '+' : ''}${coef}${indexedVar}`;
      })
      ?.join('')
      .replace(/^\+/, '') ?? expression
  );
}

// Multiplica cada coeficiente de la expresión por un factor
export function multiplyExpression(expression: string, factor: number): string {
  return (
    expression
      .replace(/\s+/g, '')
      .match(/[+-]?\d*[a-zA-Z]+\d*/g)
      ?.map((term) => {
        const match = term.match(/^([+-]?)(\d*)([a-zA-Z]+\d*)/);
        if (!match) return term;
        const [, sign, coefStr, variable] = match;
        let coef = coefStr === '' ? 1 : parseInt(coefStr);
        if (sign === '-') coef *= -1;
        coef *= factor;
        return `${coef >= 0 ? '+' : ''}${coef}${variable}`;
      })
      ?.join('')
      .replace(/^\+/, '') ?? expression
  );
}

// Multiplica el lado derecho por un factor
export function multiplyRHS(rhs: string, factor: number): string {
  const value = parseFloat(rhs);
  if (isNaN(value)) return rhs;
  return (value * factor).toString();
}

export const extractVariables = (
  objective: string,
  constraints: Constraint[]
) => {
  const allExpressions = [objective, ...constraints.map((c) => c.expression)];
  const variablePattern = /([a-zA-Z]\d*)/g;
  const variableSet = new Set<string>();

  allExpressions.forEach((expr) => {
    const matches = expr.match(variablePattern);
    if (matches) {
      matches.forEach((match) => variableSet.add(match));
    }
  });

  return Array.from(variableSet);
};
