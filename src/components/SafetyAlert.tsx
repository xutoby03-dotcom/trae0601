import { AlertTriangle, Camera, Phone } from 'lucide-react';

export function SafetyAlert() {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-amber-800 mb-2">安全提示</h4>
          <ul className="space-y-2 text-sm text-amber-700">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span><strong>请勿贸然追赶</strong>，受惊的宠物可能会跑得更远或发生危险</span>
            </li>
            <li className="flex items-start gap-2">
              <Camera className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <span><strong>先拍照记录</strong>，尽可能清晰地拍摄宠物样貌和周围环境</span>
            </li>
            <li className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <span><strong>及时联系主人</strong>，通过协寻信息中的联系方式与主人沟通</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
