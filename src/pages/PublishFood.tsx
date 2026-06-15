import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  MapPin,
  Clock,
  Package,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Building2,
  Apple,
  Cookie,
  Coffee,
} from 'lucide-react';
import { useFoodStore } from '../store/useFoodStore';
import {
  FoodCategory,
  AllergenType,
  ALLERGEN_LABELS,
  CATEGORY_LABELS,
  MEETING_ROOMS,
  DEPARTMENTS,
} from '../types';

export default function PublishFood() {
  const navigate = useNavigate();
  const { addFood } = useFoodStore();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('snack');
  const [quantity, setQuantity] = useState(10);
  const [isOpened, setIsOpened] = useState(false);
  const [allergens, setAllergens] = useState<AllergenType[]>([]);
  const [meetingRoom, setMeetingRoom] = useState(MEETING_ROOMS[0]);
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [endTime, setEndTime] = useState('');
  const [edibleHours, setEdibleHours] = useState(4);
  const [photoUrl, setPhotoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const categories: { key: FoodCategory; label: string; icon: typeof Apple }[] = [
    { key: 'fruit', label: '水果', icon: Apple },
    { key: 'snack', label: '点心', icon: Cookie },
    { key: 'beverage', label: '饮料', icon: Coffee },
  ];

  const toggleAllergen = (allergen: AllergenType) => {
    setAllergens((prev) =>
      prev.includes(allergen)
        ? prev.filter((a) => a !== allergen)
        : [...prev, allergen]
    );
  };

  const handleSubmit = () => {
    setError('');

    if (!name.trim()) {
      setError('请输入食品名称');
      return;
    }
    if (!endTime) {
      setError('请选择会议结束时间');
      return;
    }
    if (quantity < 1) {
      setError('数量必须大于0');
      return;
    }

    const finalPhotoUrl = photoUrl || getDefaultPhotoUrl(category);

    addFood({
      name: name.trim(),
      category,
      quantity,
      isOpened,
      allergens,
      meetingRoom,
      department,
      endTime: new Date(endTime).toISOString(),
      edibleHours,
      photoUrl: finalPhotoUrl,
      description: description.trim() || '美味茶歇，等你来领～',
    });

    setShowSuccess(true);
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  const getDefaultPhotoUrl = (cat: FoodCategory) => {
    const prompts = {
      fruit: 'fresh%20mixed%20fruits%20platter%20on%20white%20table%20bright%20natural%20light',
      snack: 'assorted%20pastries%20and%20desserts%20on%20elegant%20tray%20tea%20time',
      beverage: 'various%20beverages%20juice%20coffee%20tea%20refreshments%20bright',
    };
    return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${prompts[cat]}&image_size=square_hd`;
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-center animate-bounce-subtle">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-coffee-800 mb-2">发布成功！</h2>
          <p className="text-coffee-500 mb-4">食品已上架，等待员工认领</p>
          <p className="text-sm text-coffee-400">正在返回大厅...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-coffee-800 mb-2">录入剩余食品</h1>
          <p className="text-coffee-500">会议结束后，快速录入剩余茶歇，别让美味浪费</p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-3">
                <FileText className="w-4 h-4 inline mr-1" />
                食品名称
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：新鲜草莓、奶油蛋糕卷"
                className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                  text-coffee-800 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-3">
                食品品类
              </label>
              <div className="grid grid-cols-3 gap-3">
                {categories.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setCategory(key)}
                    className={`
                      flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all
                      ${category === key
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-warm-200 bg-warm-50 text-coffee-600 hover:border-warm-300'
                      }
                    `}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="font-medium text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-3">
                  <Package className="w-4 h-4 inline mr-1" />
                  数量（份）
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                    text-coffee-800 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-3">
                  <Clock className="w-4 h-4 inline mr-1" />
                  可食用时长（小时）
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={edibleHours}
                  onChange={(e) => setEdibleHours(parseFloat(e.target.value) || 1)}
                  className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                    text-coffee-800 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-3">
                是否开封
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsOpened(false)}
                  className={`
                    flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all
                    ${!isOpened
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-warm-200 bg-warm-50 text-coffee-600 hover:border-warm-300'
                    }
                  `}
                >
                  ✅ 未开封
                </button>
                <button
                  onClick={() => setIsOpened(true)}
                  className={`
                    flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all
                    ${isOpened
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-warm-200 bg-warm-50 text-coffee-600 hover:border-warm-300'
                    }
                  `}
                >
                  ⚠️ 已开封
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-3">
                <AlertTriangle className="w-4 h-4 inline mr-1 text-red-500" />
                过敏原（可多选）
              </label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(ALLERGEN_LABELS) as AllergenType[]).map((allergen) => {
                  const isImportant = allergen === 'nuts' || allergen === 'dairy';
                  const isSelected = allergens.includes(allergen);
                  return (
                    <button
                      key={allergen}
                      onClick={() => toggleAllergen(allergen)}
                      className={`
                        px-4 py-2 rounded-full text-sm font-medium transition-all
                        ${isSelected
                          ? isImportant
                            ? 'bg-red-500 text-white shadow-md'
                            : 'bg-amber-500 text-white'
                          : 'bg-warm-100 text-coffee-500 hover:bg-warm-200'
                        }
                      `}
                    >
                      {ALLERGEN_LABELS[allergen]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-3">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  会议室
                </label>
                <select
                  value={meetingRoom}
                  onChange={(e) => setMeetingRoom(e.target.value)}
                  className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                    text-coffee-800 transition-all"
                >
                  {MEETING_ROOMS.map((room) => (
                    <option key={room} value={room}>{room}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-3">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  所属部门
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                    text-coffee-800 transition-all"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-3">
                <Clock className="w-4 h-4 inline mr-1" />
                会议结束时间
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                  text-coffee-800 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-3">
                照片链接（可选）
              </label>
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="输入图片URL，不填将使用默认图片"
                className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                  text-coffee-800 transition-all"
              />
              <p className="text-xs text-coffee-400 mt-1">留空将使用品类对应的默认图片</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-3">
                描述（可选）
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="简单描述一下这个食品的特点..."
                rows={3}
                className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                  text-coffee-800 transition-all resize-none"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600
                text-white font-bold text-lg rounded-xl shadow-lg shadow-primary-200
                hover:shadow-xl hover:shadow-primary-300 hover:from-primary-600 hover:to-primary-700
                transition-all duration-300 active:scale-98"
            >
              发布认领
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
