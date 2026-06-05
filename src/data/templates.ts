export type TemplateItem = {
  name: string;
  category: string;
  latex: string;
  desc: string;
};

export const formulaTemplates: TemplateItem[] = [
  {
    name: "一元二次方程",
    category: "代数",
    latex: "◆x^2 + ◆x + ◆ = 0",
    desc: "一元二次方程一般形式 ax² + bx + c = 0",
  },
  {
    name: "二次根式",
    category: "代数",
    latex: "\\sqrt{◆}",
    desc: "二次根式 √a",
  },
  {
    name: "二次根式带系数",
    category: "代数",
    latex: "◆\\sqrt{◆}",
    desc: "带系数的二次根式 a√b",
  },
  {
    name: "矩阵2×2",
    category: "线性代数",
    latex: "\\begin{pmatrix} ◆ & ◆ \\\\ ◆ & ◆ \\end{pmatrix}",
    desc: "2×2 矩阵",
  },
  {
    name: "矩阵3×3",
    category: "线性代数",
    latex: "\\begin{pmatrix} ◆ & ◆ & ◆ \\\\ ◆ & ◆ & ◆ \\\\ ◆ & ◆ & ◆ \\end{pmatrix}",
    desc: "3×3 矩阵",
  },
  {
    name: "行列式2×2",
    category: "线性代数",
    latex: "\\begin{vmatrix} ◆ & ◆ \\\\ ◆ & ◆ \\end{vmatrix}",
    desc: "2×2 行列式",
  },
  {
    name: "行列式3×3",
    category: "线性代数",
    latex: "\\begin{vmatrix} ◆ & ◆ & ◆ \\\\ ◆ & ◆ & ◆ \\\\ ◆ & ◆ & ◆ \\end{vmatrix}",
    desc: "3×3 行列式",
  },
  {
    name: "求和级数",
    category: "级数",
    latex: "\\sum_{◆}^{◆} ◆",
    desc: "求和级数 Σ",
  },
  {
    name: "求和展开",
    category: "级数",
    latex: "\\sum_{◆=◆}^{◆} ◆",
    desc: "带初始值的求和展开",
  },
  {
    name: "牛顿二项式",
    category: "级数",
    latex: "(◆ + ◆)^{◆} = \\sum_{◆=0}^{◆} \\binom{◆}{◆} ◆^{◆-◆} ◆^{◆}",
    desc: "牛顿二项式定理展开",
  },
  {
    name: "积分",
    category: "微积分",
    latex: "\\int_{◆}^{◆} ◆ \\, d◆",
    desc: "定积分",
  },
  {
    name: "双重积分",
    category: "微积分",
    latex: "\\iint_{◆} ◆ \\, d◆ \\, d◆",
    desc: "二重积分",
  },
  {
    name: "极限",
    category: "微积分",
    latex: "\\lim_{◆ \\to ◆} ◆",
    desc: "极限表达式",
  },
  {
    name: "分式",
    category: "代数",
    latex: "\\frac{◆}{◆}",
    desc: "分式 a/b",
  },
  {
    name: "复合分式",
    category: "代数",
    latex: "\\cfrac{◆}{◆ + \\cfrac{◆}{◆}}",
    desc: "连分数/复合分式",
  },
  {
    name: "二项式系数",
    category: "代数",
    latex: "\\binom{◆}{◆}",
    desc: "二项式系数 C(n,k)",
  },
  {
    name: "傅里叶变换",
    category: "分析",
    latex: "\\hat{f}(◆) = \\int_{-\\infty}^{\\infty} f(◆) e^{-2\\pi i ◆ ◆} \\, d◆",
    desc: "傅里叶变换公式",
  },
  {
    name: "欧拉公式",
    category: "分析",
    latex: "e^{i\\pi} + 1 = 0",
    desc: "欧拉恒等式 e^(iπ) + 1 = 0",
  },
  {
    name: "泰勒展开",
    category: "分析",
    latex: "f(x) = \\sum_{◆=0}^{\\infty} \\frac{f^{(◆)}(◆)}{◆!} (x-◆)^{◆}",
    desc: "泰勒级数展开",
  },
  {
    name: "柯西积分公式",
    category: "分析",
    latex: "f(◆) = \\frac{1}{2\\pi i} \\oint_{◆} \\frac{f(◆)}{◆ - ◆} \\, d◆",
    desc: "柯西积分公式",
  },
  {
    name: "矩阵方程",
    category: "线性代数",
    latex: "\\begin{pmatrix} ◆ & ◆ \\\\ ◆ & ◆ \\end{pmatrix} \\begin{pmatrix} ◆ \\\\ ◆ \\end{pmatrix} = \\begin{pmatrix} ◆ \\\\ ◆ \\end{pmatrix}",
    desc: "矩阵与向量乘法方程",
  },
  {
    name: "向量叉积",
    category: "线性代数",
    latex: "\\vec{◆} \\times \\vec{◆} = \\begin{vmatrix} \\hat{i} & \\hat{j} & \\hat{k} \\\\ ◆ & ◆ & ◆ \\\\ ◆ & ◆ & ◆ \\end{vmatrix}",
    desc: "向量叉积的行列式表示",
  },
  {
    name: "线性方程组",
    category: "线性代数",
    latex: "\\begin{cases} ◆x + ◆y = ◆ \\\\ ◆x + ◆y = ◆ \\end{cases}",
    desc: "二元一次方程组",
  },
  {
    name: "条件函数",
    category: "代数",
    latex: "f(x) = \\begin{cases} ◆ & \\text{if } ◆ \\\\ ◆ & \\text{if } ◆ \\end{cases}",
    desc: "分段函数/条件函数",
  },
  {
    name: "麦克斯韦方程",
    category: "物理",
    latex: "\\nabla \\times \\vec{E} = -\\frac{\\partial \\vec{B}}{\\partial t}",
    desc: "麦克斯韦方程组 - 法拉第定律",
  },
];
