import { getMedicineStatus } from './src/utils/statusUtils';
import type { Medicine } from './src/types';

const testCases: { medicine: Partial<Medicine>; expected: string; description: string }[] = [
  {
    medicine: { currentQuantity: 5, minimumQuantity: 5, isExpired: false, expiryDate: '2027-01-01' },
    expected: 'low',
    description: '烫伤膏场景：库存正好等于最低数量 → 偏低(橙色提醒)，不进入采购',
  },
  {
    medicine: { currentQuantity: 4, minimumQuantity: 5, isExpired: false, expiryDate: '2027-01-01' },
    expected: 'insufficient',
    description: '库存4 < 最低5 → 不足(红色)，进入采购清单',
  },
  {
    medicine: { currentQuantity: 6, minimumQuantity: 5, isExpired: false, expiryDate: '2027-01-01' },
    expected: 'low',
    description: '库存6 < 最低5*1.5=7.5 → 偏低(橙色提醒)',
  },
  {
    medicine: { currentQuantity: 8, minimumQuantity: 5, isExpired: false, expiryDate: '2027-01-01' },
    expected: 'sufficient',
    description: '库存8 >= 最低5*1.5=7.5 → 充足(绿色)',
  },
  {
    medicine: { currentQuantity: 7, minimumQuantity: 5, isExpired: false, expiryDate: '2027-01-01' },
    expected: 'low',
    description: '库存7 < 最低5*1.5=7.5 → 偏低(橙色提醒)',
  },
  {
    medicine: { currentQuantity: 5, minimumQuantity: 5, isExpired: true, expiryDate: '2020-01-01' },
    expected: 'expired',
    description: '已过期 → 过期(红色划线)',
  },
];

console.log('🧪 边界条件测试\n');
console.log('阈值说明：');
console.log('  • 不足(insufficient): current < minimum');
console.log('  • 偏低(low): minimum ≤ current < minimum * 1.5');
console.log('  • 充足(sufficient): current ≥ minimum * 1.5\n');

let passed = 0;
let failed = 0;

testCases.forEach(({ medicine, expected, description }, index) => {
  const result = getMedicineStatus(medicine as Medicine);
  const status = result === expected ? '✅ PASS' : '❌ FAIL';
  
  if (result === expected) {
    passed++;
  } else {
    failed++;
  }
  
  console.log(`${status} 测试 ${index + 1}: ${description}`);
  console.log(`   库存: ${medicine.currentQuantity}, 最低: ${medicine.minimumQuantity}`);
  console.log(`   期望: ${expected}, 实际: ${result}\n`);
});

console.log('📊 测试结果:');
console.log(`   通过: ${passed}/${testCases.length}`);
console.log(`   失败: ${failed}/${testCases.length}`);

if (failed > 0) {
  process.exit(1);
}
