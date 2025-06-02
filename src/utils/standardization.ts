import { Constraint, LinearProblem } from '../types/linearProgramming';

export function standardizeDual(problem: LinearProblem): LinearProblem {
  const standardized: LinearProblem = JSON.parse(JSON.stringify(problem));

  let slackCount = 1;
  let artificialACount = 1;
  let artificialMACount = 1;

  let objectiveExpression = standardized.objectiveFunction.trim();

  standardized.constraints = standardized.constraints.map((constraint) => {
    const newConstraint: Constraint = { ...constraint };
    let expression = constraint.expression;

    const slackVar = `S${slackCount}`;
    const artificialAVar = `A${artificialACount}`;
    const artificialMAVar = `MA${artificialMACount}`;

    let contribution = ''; // Contribución a Z

    switch (constraint.type) {
      case '>=':
        expression += ` - ${slackVar} + ${artificialAVar}`;
        standardized.variables.push(slackVar, artificialAVar);

        contribution =
          problem.objectiveType === 'max'
            ? ` - ${artificialMAVar}`
            : ` + ${artificialMAVar}`;

        objectiveExpression += ` + 0${slackVar}` + contribution;

        slackCount++;
        artificialACount++;
        artificialMACount++;
        break;

      case '<=':
        expression += ` + ${slackVar}`;
        standardized.variables.push(slackVar);

        objectiveExpression += ` + 0${slackVar}`;

        slackCount++;
        break;
    }

    newConstraint.expression = expression;
    newConstraint.type = '=';

    return newConstraint;
  });

  standardized.variables = Array.from(new Set(standardized.variables));
  standardized.objectiveFunction = objectiveExpression.trim();

  return standardized;
}

// La función standardizePrimal ya no se usa pero la mantenemos por compatibilidad
export function standardizePrimal(problem: LinearProblem): LinearProblem {
  return problem;
}
