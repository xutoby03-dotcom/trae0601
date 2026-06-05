import { StreamLanguage, StringStream, LanguageSupport } from '@codemirror/language'

const latexKeywords = new Set([
  'frac', 'dfrac', 'tfrac', 'cfrac', 'sqrt', 'sum', 'prod', 'coprod',
  'int', 'iint', 'iiint', 'oint', 'lim', 'min', 'max', 'sup', 'inf',
  'sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'arcsin', 'arccos', 'arctan',
  'sinh', 'cosh', 'tanh', 'log', 'ln', 'exp', 'det', 'dim', 'arg',
  'begin', 'end', 'left', 'right', 'bigl', 'bigr', 'Bigl', 'Bigr',
  'biggl', 'biggr', 'displaystyle', 'textstyle', 'scriptstyle',
  'hat', 'bar', 'vec', 'dot', 'ddot', 'tilde', 'overline', 'underline',
  'overrightarrow', 'overleftarrow', 'mathbf', 'mathit', 'mathrm',
  'mathsf', 'mathtt', 'mathbb', 'mathcal', 'mathscr', 'mathfrak',
  'text', 'textbf', 'textit', 'color', 'textcolor', 'colorbox',
  'fcolorbox', 'overset', 'underset', 'stackrel', 'substack',
  'binom', 'tbinom', 'dbinom', 'cases', 'pmatrix', 'bmatrix',
  'vmatrix', 'Vmatrix', 'array', 'aligned', 'gathered', 'split',
  'equation', 'align', 'gather', 'multline', 'eqnarray',
  'centering', 'raggedright', 'raggedleft',
  'item', 'caption', 'label', 'ref', 'cite', 'footnote',
  'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'varepsilon',
  'zeta', 'eta', 'theta', 'vartheta', 'iota', 'kappa', 'lambda',
  'mu', 'nu', 'xi', 'pi', 'varpi', 'rho', 'varrho', 'sigma',
  'varsigma', 'tau', 'upsilon', 'phi', 'varphi', 'chi', 'psi', 'omega',
  'Gamma', 'Delta', 'Theta', 'Lambda', 'Xi', 'Pi', 'Sigma',
  'Upsilon', 'Phi', 'Psi', 'Omega',
  'infty', 'partial', 'nabla', 'forall', 'exists', 'neg', 'emptyset',
  'aleph', 'hbar', 'ell', 'wp', 'Re', 'Im', 'complement',
  'prime', 'angle', 'triangle', 'square', 'diamond',
  'rightarrow', 'leftarrow', 'leftrightarrow', 'Rightarrow', 'Leftarrow',
  'Leftrightarrow', 'mapsto', 'uparrow', 'downarrow',
  'leq', 'geq', 'neq', 'approx', 'cong', 'sim', 'equiv',
  'subset', 'supset', 'subseteq', 'supseteq', 'in', 'notin',
  'times', 'div', 'pm', 'mp', 'cdot', 'circ', 'star', 'ast',
  'oplus', 'otimes', 'odot', 'wedge', 'vee', 'cap', 'cup',
  'dagger', 'ddagger', 'parallel', 'perp', 'propto',
  'ldots', 'cdots', 'vdots', 'ddots',
  'langle', 'rangle', 'lfloor', 'rfloor', 'lceil', 'rceil',
  'lbrace', 'rbrace', 'lgroup', 'rgroup',
  'bigwedge', 'bigvee', 'bigcap', 'bigcup', 'bigoplus', 'bigotimes', 'bigodot',
  'checkmark', 'surd', 'imath', 'jmath',
])

interface LatexState {
  inMath: boolean
  braceDepth: number
}

const latexStreamParser = {
  name: 'latex',
  startState: (): LatexState => ({ inMath: false, braceDepth: 0 }),
  token: (stream: StringStream, state: LatexState): string | null => {
    if (stream.eatSpace()) return null

    const ch = stream.next() as string

    if (ch === '%') {
      stream.skipToEnd()
      return 'comment'
    }

    if (ch === '\\') {
      if (stream.match(/[a-zA-Z]+/)) {
        const cmd = stream.current().slice(1)
        if (latexKeywords.has(cmd)) return 'keyword'
        return 'variableName'
      }
      if (stream.next()) return 'string'
      return 'variableName'
    }

    if (ch === '{') {
      state.braceDepth++
      return 'bracket'
    }
    if (ch === '}') {
      state.braceDepth--
      return 'bracket'
    }

    if (ch === '$') {
      if (stream.eat('$')) {
        state.inMath = !state.inMath
        return 'string strong'
      }
      state.inMath = !state.inMath
      return 'string'
    }

    if (ch === '_' || ch === '^') {
      stream.eat(/[a-zA-Z0-9{}]/)
      return 'atom'
    }

    if (ch === '&' || ch === '#') {
      return 'operator'
    }

    if (/[0-9]/.test(ch)) {
      stream.eatWhile(/[0-9.]/)
      return 'number'
    }

    return null
  },
}

export const latexLanguage = StreamLanguage.define(latexStreamParser)

export function latexSupport() {
  return new LanguageSupport(latexLanguage)
}
