import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  PawPrint,
  Sparkles,
  Scale,
  AlertTriangle,
  MessageCircleHeart,
  Package,
  Phone,
  Check,
  Camera,
  X,
} from "lucide-react";
import { usePetStore } from "@/store/usePetStore";
import { HairLength, HAIR_LENGTH_META } from "@/types";

const petPhotos = [
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop",
];

export default function NewOrder() {
  const navigate = useNavigate();
  const { packages, createOrder } = usePetStore();

  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [weight, setWeight] = useState("");
  const [hairLength, setHairLength] = useState<HairLength>("short");
  const [allergies, setAllergies] = useState("");
  const [temperament, setTemperament] = useState("");
  const [photoUrl, setPhotoUrl] = useState(petPhotos[0]);
  const [selectedPackageId, setSelectedPackageId] = useState(packages[0]?.id || "");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !breed || !weight || !selectedPackageId || !ownerPhone) return;

    const newOrder = createOrder(
      {
        name,
        breed,
        weight: parseFloat(weight),
        hairLength,
        allergies: allergies ? allergies.split(/[,，、\s]+/).filter(Boolean) : ["无"],
        temperament: temperament || "暂无备注",
        photoUrl,
      },
      selectedPackageId,
      ownerPhone
    );

    setSubmitted(true);
    setTimeout(() => {
      navigate(`/order/${newOrder.id}`);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success-500 flex items-center justify-center shadow-lg shadow-success-500/30 animate-fade-in-up">
          <Check className="w-10 h-10 text-white" />
        </div>
        <h2 className="font-display text-2xl font-bold text-brown-900 mb-2 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          订单创建成功！
        </h2>
        <p className="text-brown-700/60 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          正在跳转到订单详情...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <div className="mb-6 animate-fade-in-up">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-brown-700/60 hover:text-brown-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          返回看板
        </Link>
        <h1 className="font-display text-3xl font-bold text-brown-900">
          新建订单
        </h1>
        <p className="text-brown-700/60 mt-1">
          录入宠物信息并选择服务套餐
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="card p-6 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-5">
                <Camera className="w-5 h-5 text-primary-500" />
                <h3 className="font-display font-bold text-brown-900 text-lg">
                  入店照片
                </h3>
              </div>

              <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 ring-2 ring-primary-100">
                <img
                  src={photoUrl}
                  alt="宠物照片"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                  <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full text-sm font-medium text-brown-800">
                    <Upload className="w-4 h-4" />
                    更换照片
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {petPhotos.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPhotoUrl(url)}
                    className={`relative aspect-square rounded-xl overflow-hidden transition-all ${
                      photoUrl === url
                        ? "ring-2 ring-primary-500 ring-offset-2"
                        : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`示例${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6 animate-fade-in-up" style={{ animationDelay: "50ms" }}>
              <div className="flex items-center gap-2 mb-5">
                <PawPrint className="w-5 h-5 text-primary-500" />
                <h3 className="font-display font-bold text-brown-900 text-lg">
                  宠物档案
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-text">
                    宠物名字 <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="如：豆豆"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label-text">
                    品种 <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    placeholder="如：柯基、英短"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label-text">
                    <Scale className="w-3.5 h-3.5 inline mr-1" />
                    体重 (kg) <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="如：10.5"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label-text">
                    <Sparkles className="w-3.5 h-3.5 inline mr-1" />
                    毛发长度
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(HAIR_LENGTH_META) as HairLength[]).map(
                      (h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setHairLength(h)}
                          className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                            hairLength === h
                              ? "bg-primary-500 text-white shadow-md shadow-primary-200"
                              : "bg-cream-50 text-brown-700/70 hover:bg-cream-100"
                          }`}
                        >
                          {HAIR_LENGTH_META[h]}
                        </button>
                      )
                    )}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="label-text">
                    <AlertTriangle className="w-3.5 h-3.5 inline mr-1 text-danger-500" />
                    过敏项
                  </label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="多项用逗号或空格分隔，如：鸡肉, 尘螨"
                    className="input-field"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label-text">
                    <MessageCircleHeart className="w-3.5 h-3.5 inline mr-1 text-primary-500" />
                    脾气备注
                  </label>
                  <textarea
                    value={temperament}
                    onChange={(e) => setTemperament(e.target.value)}
                    placeholder="如：亲人乖巧、有点胆小需要慢慢来..."
                    className="input-field resize-none h-20"
                  />
                </div>
              </div>
            </div>

            <div className="card p-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <div className="flex items-center gap-2 mb-5">
                <Package className="w-5 h-5 text-primary-500" />
                <h3 className="font-display font-bold text-brown-900 text-lg">
                  服务套餐
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={`text-left p-4 rounded-2xl border-2 transition-all ${
                      selectedPackageId === pkg.id
                        ? "border-primary-500 bg-primary-50/50"
                        : "border-cream-200 bg-white hover:border-primary-200"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-semibold text-brown-900">
                        {pkg.name}
                      </span>
                      {selectedPackageId === pkg.id && (
                        <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-brown-700/60 mb-2">
                      {pkg.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-primary-600 font-bold">
                        ¥{pkg.price}
                      </span>
                      <span className="text-xs text-brown-700/50">
                        约 {pkg.durationMinutes} 分钟
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-6 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
              <div className="flex items-center gap-2 mb-5">
                <Phone className="w-5 h-5 text-primary-500" />
                <h3 className="font-display font-bold text-brown-900 text-lg">
                  主人联系方式
                </h3>
              </div>

              <input
                type="tel"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="请输入手机号码"
                className="input-field"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <Link to="/" className="btn-ghost">
                <X className="w-4 h-4" />
                取消
              </Link>
              <button
                type="submit"
                className="btn-primary"
                disabled={
                  !name ||
                  !breed ||
                  !weight ||
                  !selectedPackageId ||
                  !ownerPhone
                }
              >
                <Check className="w-4 h-4" />
                创建订单
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
