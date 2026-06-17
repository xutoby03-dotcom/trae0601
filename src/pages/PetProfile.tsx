import { usePetStore } from '../store/usePetStore';
import PetCard from '../components/PetCard';
import { Images } from 'lucide-react';

export default function PetProfile() {
  const { pet } = usePetStore();

  return (
    <div className="space-y-8">
      <div className="text-center mb-8 animate-fadeIn">
        <h1 className="text-3xl font-bold text-[#2D2A26] mb-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>
          欢迎来到{pet.name}的小窝 🏠
        </h1>
        <p className="text-gray-500">这里记录了{pet.name}的所有重要信息</p>
      </div>

      <PetCard pet={pet} />

      <div className="bg-white rounded-2xl p-6 shadow-lg shadow-orange-100/50 animate-slideUp" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <Images size={20} className="text-[#FF8A3D]" />
          </div>
          <h2 className="text-xl font-bold text-[#2D2A26]" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            {pet.name}的生活照 📸
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {pet.photos.map((photo, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
              style={{ animationDelay: `${index * 100 + 300}ms` }}
            >
              <img
                src={photo}
                alt={`${pet.name}的照片 ${index + 1}`}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white text-sm font-medium">
                  {['慵懒时光', '窗边发呆', '快乐玩耍', '干饭时刻'][index]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100 animate-slideUp" style={{ animationDelay: '400ms' }}>
        <h3 className="text-lg font-bold text-[#2D2A26] mb-3" style={{ fontFamily: "'Noto Serif SC', serif" }}>
          💡 代喂小贴士
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-[#FF8A3D]">•</span>
            <span>进门先轻声叫{pet.name}的名字，让它慢慢适应你的气味</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#FF8A3D]">•</span>
            <span>喂食时请先洗手，猫粮用量勺准确称量 {pet.foodAmount}g</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#FF8A3D]">•</span>
            <span>换水前请清洗水盆，每天更换新鲜饮用水</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#FF8A3D]">•</span>
            <span>铲屎时注意观察便便形态，异常请及时拍照记录</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#FF8A3D]">•</span>
            <span>离开时请检查门窗是否锁好，确认{pet.name}安全</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
