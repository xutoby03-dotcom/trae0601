const http = require('http');

http.get('http://localhost:3001/api/lendings', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const records = JSON.parse(data);
    console.log('借出记录总数:', records.length);
    records.forEach((r, i) => {
      const unreturned = r.items.filter(x => !x.returned).length;
      console.log(`${i + 1}. ${r.reservation?.className || '-'} | 领用人: ${r.lenderName} | 还: ${r.items.length - unreturned}/${r.items.length} | ID: ${r.id}`);
      console.log(`   服装ID列表: ${r.items.map(x => `${x.costumeId}`).join(', ')}`);
    });
  });
});
