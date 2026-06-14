const http = require('http');

const id = '4303e629-d689-48d3-af99-983ab10d86a0';
const data = JSON.stringify({
  items: [
    {
      costumeId: 'c-s-002',
      accessoryCheck: { hat: true, tassel: true, bowtie: true, shawl: false },
      hasStain: false,
      damageNote: ''
    },
    {
      costumeId: 'c-s-003',
      accessoryCheck: { hat: true, tassel: true, bowtie: false, shawl: true },
      hasStain: true,
      damageNote: ''
    },
    {
      costumeId: 'c-s-004',
      accessoryCheck: { hat: true, tassel: true, bowtie: true, shawl: true },
      hasStain: false,
      damageNote: '拉链损坏，需更换'
    }
  ]
});

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: `/api/returns/${id}/return`,
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const parsed = JSON.parse(body);
      console.log('Response keys:', Object.keys(parsed));
      if (parsed.damageSummary) {
        console.log('damageSummary:', JSON.stringify(parsed.damageSummary, null, 2));
      }
      if (parsed.error) console.log('Error:', parsed.error);
      if (parsed.id) console.log('Record id:', parsed.id);
      if (parsed.items) {
        console.log('Items returned:', parsed.items.length);
        parsed.items.forEach((i, idx) => {
          console.log(`  ${idx+1}. ${i.costumeId} returned=${i.returned}, accessoryCheck=${JSON.stringify(i.accessoryCheck)}`);
        });
      }
    } catch(e) {
      console.log('Raw body:', body.substring(0, 800));
    }
  });
});
req.on('error', e => console.log('Request error:', e.message));
req.write(data);
req.end();
