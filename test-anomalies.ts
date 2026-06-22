import { generateTickIntervals, detectAnomalies } from './src/utils/tickSimulation';

function testScenario(name: string, params: {
  pendulumLength: number;
  escapementPosition: number;
  windingDegree: number;
  testDuration: number;
  hourlyError: number;
}, expectedAnomalies: string[]) {
  console.log(`\n=== 测试场景: ${name} ===`);
  console.log(`参数: 摆长=${params.pendulumLength}mm, 叉位=${params.escapementPosition}°, 上弦=${params.windingDegree}%, 误差=${params.hourlyError}s/h`);

  const ticks = generateTickIntervals(
    params.pendulumLength,
    params.escapementPosition,
    params.windingDegree,
    params.testDuration,
    params.hourlyError
  );

  const anomalies = detectAnomalies(ticks, 'test-session', 'test-record');

  const anomalyTypes = Array.from(new Set(anomalies.map(a => a.type)));
  console.log(`生成 ${ticks.length} 个滴答点，检测到 ${anomalies.length} 个异常`);
  console.log(`异常类型: ${anomalyTypes.join(', ') || '无'}`);

  anomalies.forEach(a => {
    console.log(`  - ${a.type} (${a.severity}): ${a.description}`);
  });

  const missing = expectedAnomalies.filter(t => !anomalyTypes.includes(t));
  const unexpected = anomalyTypes.filter(t => !expectedAnomalies.includes(t));

  if (missing.length === 0 && unexpected.length === 0) {
    console.log(`✓ 测试通过`);
  } else {
    if (missing.length > 0) console.log(`✗ 缺少预期异常: ${missing.join(', ')}`);
    if (unexpected.length > 0) console.log(`✗ 意外异常: ${unexpected.join(', ')}`);
  }

  return { anomalyTypes, anomalies, ticks };
}

console.log('\n========== 异常触发测试 ==========');

testScenario('参数正常 - 无异常', {
  pendulumLength: 100,
  escapementPosition: 0,
  windingDegree: 85,
  testDuration: 1,
  hourlyError: 0.5,
}, []);

testScenario('上弦不足 < 30% - 触发停摆', {
  pendulumLength: 100,
  escapementPosition: 0,
  windingDegree: 20,
  testDuration: 1,
  hourlyError: 2,
}, ['STOPPED', 'WEAK_RETURN']);

testScenario('摆长过短 < 70mm - 触发停摆', {
  pendulumLength: 60,
  escapementPosition: 0,
  windingDegree: 80,
  testDuration: 1,
  hourlyError: 1,
}, ['STOPPED']);

testScenario('摆长过长 > 130mm - 触发回摆无力', {
  pendulumLength: 150,
  escapementPosition: 0,
  windingDegree: 80,
  testDuration: 1,
  hourlyError: 0.5,
}, ['WEAK_RETURN']);

testScenario('叉位极端 > 10° - 触发齿轮卡滞', {
  pendulumLength: 100,
  escapementPosition: 25,
  windingDegree: 85,
  testDuration: 1,
  hourlyError: 1,
}, ['GEAR_JAM', 'OFF_BEAT']);

testScenario('严重故障 - 所有异常', {
  pendulumLength: 65,
  escapementPosition: 30,
  windingDegree: 15,
  testDuration: 1,
  hourlyError: 8,
}, ['STOPPED', 'WEAK_RETURN', 'GEAR_JAM', 'OFF_BEAT']);

console.log('\n========== 测试完成 ==========');
