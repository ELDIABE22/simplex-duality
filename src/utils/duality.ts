import {
  LinearProblem,
  Constraint,
  ObjectiveType,
} from '../types/linearProgramming';
import { parseExpression } from './parser';

/**
 * Converts a primal linear programming problem to its dual form
 */
export function convertToDual(primal: LinearProblem): LinearProblem {
  // 1. Flip the objective type (max becomes min, min becomes max)
  const dualObjectiveType: ObjectiveType =
    primal.objectiveType === 'max' ? 'min' : 'max';

  // 2. The RHS values of primal constraints become coefficients in the dual objective function
  const dualObjectiveCoefficients: { [key: string]: number } = {};
  const dualVariables: string[] = [];

  for (let i = 0; i < primal.constraints.length; i++) {
    const constraint = primal.constraints[i];
    const varName = `y${i + 1}`;
    dualVariables.push(varName);
    dualObjectiveCoefficients[varName] = parseFloat(constraint.rhs);
  }

  const dualObjectiveFunction = dualVariables
    .map((v) => `${dualObjectiveCoefficients[v]} ${v}`)
    .join(' + ');

  // 3. Create dual constraints from primal objective coefficients
  const dualConstraints: Constraint[] = [];

  // Parse the primal objective function to get coefficients
  const primalObjCoefficients = parseExpression(primal.objectiveFunction);

  // For each primal variable, create a constraint in the dual
  Object.keys(primalObjCoefficients).forEach((primalVar) => {
    // Collect the coefficients from each primal constraint for this variable
    const constraintCoeffs: number[] = [];

    primal.constraints.forEach((constraint) => {
      const coeffs = parseExpression(constraint.expression);
      constraintCoeffs.push(coeffs[primalVar] || 0);
    });

    // Create the dual constraint expression
    const dualExpr = constraintCoeffs
      .map((coeff, i) => `${coeff} y${i + 1}`)
      .filter((term) => !term.startsWith('0 '))
      .join(' + ');

    // Determine the constraint type based on the primal objective type
    let dualConstraintType: '<=' | '=' | '>=' = '=';
    if (primal.objectiveType === 'max') {
      dualConstraintType = '>=';
    } else {
      dualConstraintType = '<=';
    }

    dualConstraints.push({
      expression: dualExpr,
      type: dualConstraintType,
      rhs: primalObjCoefficients[primalVar].toString(),
    });
  });

  return {
    objectiveType: dualObjectiveType,
    objectiveFunction: dualObjectiveFunction,
    constraints: dualConstraints,
    variables: dualVariables,
  };
}
