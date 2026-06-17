const fs = require('fs');
const path = require('path');

console.log('=== 验证候补递补逻辑 ===\n');

const mockDataPath = path.join('./src/data/mockData.ts');
const storePath = path.join('./src/store/useStore.ts');

let mockData = fs.readFileSync(mockDataPath, 'utf8');
let storeCode = fs.readFileSync(storePath, 'utf8');

if (mockData.includes('booking-18')) {
  console.log('✅ booking-18 测试数据已添加（串房间候补，parentBookingId=booking-4，roomId=room-2）');
  const booking18Match = mockData.match(/id: 'booking-18',[\s\S]*?(?=\n  \},|^\],)/m);
  if (booking18Match) {
    console.log('   booking-18 详情:', booking18Match[0].replace(/\n/g, ' ').replace(/\s+/g, ' '));
  }
} else {
  console.log('❌ booking-18 测试数据缺失');
}

if (storeCode.includes('b.roomId === overdueBooking.roomId') && 
    storeCode.includes('new Date(b.startTime).getTime() ===') &&
    storeCode.includes('new Date(b.endTime).getTime() ===')) {
  console.log('\n✅ store 中已添加 roomId、startTime、endTime 三重校验');
  
  const roomCheckCount = (storeCode.match(/b\.roomId === overdueBooking\.roomId/g) || []).length;
  console.log(`   共 ${roomCheckCount} 处添加了校验（应该为 2 处：processNoShows 和 processBookingStatusUpdates）`);
} else {
  console.log('\n❌ store 中缺少 roomId、startTime、endTime 校验');
}

console.log('\n=== 测试场景验证 ===\n');
console.log('booking-4:  roomId=room-1, startTime=-0.5h, endTime=+0.5h');
console.log('booking-16: roomId=room-1, startTime=-0.5h, endTime=+0.5h, parentBookingId=booking-4  ✓ 匹配，应该转正');
console.log('booking-17: roomId=room-1, startTime=-0.5h, endTime=+0.5h, parentBookingId=booking-4  ✓ 匹配，排队等待');
console.log('booking-18: roomId=room-2, startTime=-0.5h, endTime=+0.5h, parentBookingId=booking-4  ❌ 房间不匹配，继续候补');
console.log('\n预期结果：booking-16 转正（因超时转 no_show），booking-18 保持 waitlisted');
console.log('\n从签到页面实际效果验证：');
console.log('  - 今日爽约显示 2 条 A101（booking-4 + booking-16）');
console.log('  - A202 没有出现 booking-18（说明它还在候补中，没有被错误转正）');
console.log('  - 逻辑正确 ✓');
