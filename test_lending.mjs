// 测试借出接口
const BASE = 'http://localhost:3001/api';

async function test() {
  // 1. 获取所有预约
  const allRes = await fetch(`${BASE}/reservations`).then(r => r.json());
  const approved = allRes.find(r => r.status === '已通过');
  if (!approved) {
    console.log('No approved reservation found');
    return;
  }
  console.log('Using reservation:', approved.id, approved.className);

  // 2. 获取借出中的服装ID
  const allLendings = await fetch(`${BASE}/lendings`).then(r => r.json());
  let lentIds = [];
  if (allLendings.length > 0) {
    lentIds = allLendings[0].items.map(i => i.costumeId);
  }
  console.log('Lent costume IDs:', lentIds);

  // 3. 混合测试: 借出中的 + 在库的
  const testIds = [
    lentIds[0] || 'c-xs-001', // 借出中的
    'c-s-007',
    'c-s-008'
  ];
  console.log('\n=== Testing with mixed IDs ===');
  console.log('Submitting IDs:', testIds);

  const resp = await fetch(`${BASE}/lendings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reservationId: approved.id,
      lenderName: '测试用户',
      costumeIds: testIds
    })
  });

  const data = await resp.json();
  console.log('Status:', resp.status);
  console.log('Response:', JSON.stringify(data, null, 2));
}

test().catch(console.error);
