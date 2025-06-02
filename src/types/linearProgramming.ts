export type ObjectiveType = 'max' | 'min';

export type ModelType = 'PRIMAL' | 'DUAL' | 'PRIMAL_ESTD' | 'DUAL_ESTD';

export interface Constraint {
  expression: string;
  type: '<=' | '=' | '>=';
  rhs: string;
}

export interface LinearProblem {
  objectiveType: ObjectiveType;
  objectiveFunction: string;
  constraints: Constraint[];
  variables: string[];
  modelType?: ModelType;
}

export interface SimplexTable {
  cj: (string | number)[];
  variables: string[];
  bi: number[];
  ciAndBi: { variables: string[]; values: (string | number)[] };
  zj: string[];
  oi: (number | null)[] | undefined;
  matrix: (number | string)[][];
  cjMinusZj: string[]; // ← Nuevo
  objectiveType: ObjectiveType;
  evaluatedCjMinusZj?: number[] | null;
  violationExpressions?: string[] | null;
  mostViolating?: string | null;
  mostViolatingIndex?: number | null;
  enteringVariable?: { cj: string | number; variable: string };
  leavingVariable?: { ci: string | number; vb: string };
  pivotRow?: number | string;
  pivotCol?: number;
}
