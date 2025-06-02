/**
 * Parses a linear expression into a coefficient map
 * e.g. "3x1 + 4x2 - 2x3" => { x1: 3, x2: 4, x3: -2 }
 */
export function parseExpression(expression: string): {
  [variable: string]: number | string;
} {
  const coefficients: { [variable: string]: number | string } = {};

  // Normalize the expression
  let normalized = expression
    .replace(/\s+/g, '') // Remove whitespace
    .replace(/-/g, '+-') // Replace - with +-
    .replace(/(\d)([a-zA-Z])/g, '$1*$2'); // Add * between number and letter (2x → 2*x)

  if (normalized.startsWith('+')) {
    normalized = normalized.slice(1);
  }

  normalized.split('+').forEach((term) => {
    if (!term) return;

    // Detecta términos como 6M, -6M
    const mMatch = term.match(/^(-?)(\d*\.?\d*)M$/);
    if (mMatch) {
      const [, sign, coeff] = mMatch;
      const value = coeff ? parseFloat(sign + coeff) : sign === '-' ? -1 : 1;
      coefficients['M'] = Number.isInteger(value)
        ? value
        : Number(value.toFixed(2));
      return;
    }

    // Detecta términos especiales tipo MA1, MA2, etc.
    const maMatch = term.match(/^(-?)M([A-Za-z0-9]+)$/);
    if (maMatch) {
      const [, sign, variable] = maMatch;
      coefficients[variable] = sign === '-' ? '-M' : 'M';
      return;
    }

    // Detecta términos normales con variables (ej: 2*x, -3*y)
    if (/[a-zA-Z]/.test(term)) {
      const parts = term.split('*');
      if (parts.length === 1) {
        // Solo variable, como z o -z
        const varName = parts[0].replace(/^-/, '');
        coefficients[varName] = term.startsWith('-') ? -1 : 1;
      } else {
        const coeff = parseFloat(parts[0]);
        const varName = parts[1];
        coefficients[varName] = Number.isInteger(coeff)
          ? coeff
          : Number(coeff.toFixed(2));
      }
    } else {
      // Términos constantes puros
      const coeff = parseFloat(term);
      if (!isNaN(coeff)) {
        coefficients['constant'] = Number.isInteger(coeff)
          ? coeff
          : Number(coeff.toFixed(2));
      }
    }
  });

  return coefficients;
}

/**
 * Parses a constraint into its components
 */
export function parseConstraint(constraintStr: string): {
  lhs: { [variable: string]: number | string };
  type: '<=' | '=' | '>=';
  rhs: number;
} {
  // Find the constraint type
  let type: '<=' | '=' | '>=' = '=';
  let parts: string[] = [];

  if (constraintStr.includes('<=')) {
    type = '<=';
    parts = constraintStr.split('<=');
  } else if (constraintStr.includes('>=')) {
    type = '>=';
    parts = constraintStr.split('>=');
  } else if (constraintStr.includes('=')) {
    type = '=';
    parts = constraintStr.split('=');
  }

  if (parts.length !== 2) {
    throw new Error(`Invalid constraint format: ${constraintStr}`);
  }

  const lhs = parseExpression(parts[0]);
  const rhs = parseFloat(parts[1].trim());

  return { lhs, type, rhs };
}

export function analyzeObjectiveFunction(objectiveFunction: string): {
  variables: string[];
  values: (string | number)[];
} {
  const tokens = objectiveFunction
    .replace(/([+-])/g, ' $1')
    .trim()
    .split(/\s+/);

  const variables: string[] = [];
  const values: (string | number)[] = [];

  const sVars = new Set<string>();
  const aVars = new Set<string>();

  const positions: { type: 'S' | 'A'; id: string; index: number }[] = [];

  tokens.forEach((token, index) => {
    const sMatch = token.match(/[+-]?0S(\d+)/);
    const aMatch = token.match(/[+-]?MA(\d+)/);

    if (sMatch) {
      const id = sMatch[1];
      sVars.add(`S${id}`);
      positions.push({ type: 'S', id, index });
    }

    if (aMatch) {
      const id = aMatch[1];
      aVars.add(`A${id}`);
      positions.push({ type: 'A', id, index });
    }
  });

  const paired = new Set<string>();
  for (let i = 0; i < positions.length - 1; i++) {
    const curr = positions[i];
    const next = positions[i + 1];

    if (curr.type === 'S' && next.type === 'A' && curr.id === next.id) {
      variables.push(`A${curr.id}`);
      values.push('M');
      paired.add(curr.id);
      i++;
    }
  }

  sVars.forEach((s) => {
    const id = s.slice(1);
    if (!paired.has(id)) {
      variables.push(s);
      values.push(0);
    }
  });

  aVars.forEach((a) => {
    const id = a.slice(1);
    if (!paired.has(id)) {
      variables.push(a);
      values.push('M');
    }
  });

  return { variables, values };
}

export function negateExpression(expr: string): string {
  if (expr.startsWith('-')) {
    return expr.slice(1);
  }
  return `-${expr}`;
}

export function formatCjMinusZj(cjStr: string, zjExpr: string): string {
  // Parsear cjStr y zjExpr
  const cjTerms = parseExpression(cjStr); // "6" → { constant: 6 }
  const zjTerms = parseExpression(zjExpr); // "6M" → { M: 6 }

  // Inicializar términos resultantes
  const resultTerms: { [variable: string]: number | string } = {};

  // Combinar términos (constantes y M)
  const allKeys = new Set([...Object.keys(cjTerms), ...Object.keys(zjTerms)]);
  allKeys.forEach((key) => {
    const cjVal = cjTerms[key] || 0;
    const zjVal = zjTerms[key] || 0;

    if (key === 'constant') {
      const diff = (Number(cjVal) || 0) - (Number(zjVal) || 0);
      if (diff !== 0) {
        resultTerms[key] = Number.isInteger(diff)
          ? diff
          : Number(diff.toFixed(2));
      }
    } else if (key === 'M') {
      const diff = (Number(cjVal) || 0) - (Number(zjVal) || 0);
      if (diff !== 0) {
        resultTerms[key] = Number.isInteger(diff)
          ? diff
          : Number(diff.toFixed(2));
      }
    } else {
      // Otros términos (MA1, MA2, etc.)
      const cjCoeff =
        cjVal === 'M' ? 1 : cjVal === '-M' ? -1 : Number(cjVal) || 0;
      const zjCoeff =
        zjVal === 'M' ? 1 : zjVal === '-M' ? -1 : Number(zjVal) || 0;
      const diff = cjCoeff - zjCoeff;
      if (diff !== 0) {
        resultTerms[key] =
          diff === 1
            ? 'M'
            : diff === -1
            ? '-M'
            : Number.isInteger(diff)
            ? diff
            : Number(diff.toFixed(2));
      }
    }
  });

  // Formatear el resultado
  const terms: string[] = [];
  if (resultTerms['constant']) {
    terms.push(resultTerms['constant'].toString());
  }
  Object.entries(resultTerms).forEach(([key, coeff]) => {
    if (key === 'constant') return;
    if (key === 'M' && typeof coeff === 'number') {
      if (coeff === 1) terms.push('M');
      else if (coeff === -1) terms.push('-M');
      else terms.push(`${coeff}M`);
    } else if (typeof coeff === 'string') {
      terms.push(coeff);
    } else if (coeff !== 0) {
      if (coeff === 1) terms.push(key);
      else if (coeff === -1) terms.push(`-${key}`);
      else terms.push(`${coeff}${key}`);
    }
  });

  // Unir términos y limpiar formato
  const expression = terms.join(' + ').replace(/\+ -/g, '- ');
  return expression || '0';
}

export function evaluateExpression(expr: string): number {
  const M = 100;
  let replaced = expr
    .replace(/\s+/g, '') // Remove whitespace
    .replace(/(\d*\.?\d*)M/g, (_, coeff) => {
      const n = coeff === '' ? 1 : parseFloat(coeff);
      return `${n * M}`;
    })
    .replace(/M/g, `${M}`); // Handle lone "M"

  // Ensure proper operator spacing for eval
  replaced = replaced
    .replace(/(\d)([+-])/g, '$1 $2 ')
    .replace(/([+-])(\d)/g, '$1 $2');

  try {
    const result = eval(replaced);
    return Number.isInteger(result) ? result : Number(result.toFixed(2));
  } catch (e) {
    console.error(`No se pudo evaluar la expresión: ${expr}`, e);
    return NaN;
  }
}

export function formatZjExpression(expr: string): string {
  return expr.replace(/-?\d+(\.\d+)?/g, (match) => {
    const num = parseFloat(match);
    return Number.isInteger(num) ? match : num.toFixed(2);
  });
}
