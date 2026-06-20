import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, User, MapPin, Phone, ChevronRight } from "lucide-react";
import { useElderStore } from "../store/useElderStore";
import { mobilityLabels, genderLabels } from "../types/elder";

export function ElderList() {
  const navigate = useNavigate();
  const { elders, searchElders, loadElders, loading } = useElderStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [displayElders, setDisplayElders] = useState(elders);

  useEffect(() => {
    loadElders();
  }, [loadElders]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setDisplayElders(searchElders(searchQuery));
    } else {
      setDisplayElders(elders);
    }
  }, [searchQuery, elders, searchElders]);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">老人档案</h1>
          <p className="text-gray-500 mt-1">管理社区老人的基本信息</p>
        </div>
        <button
          onClick={() => navigate("/elders/new")}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium"
        >
          <Plus size={20} />
          新建档案
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="搜索老人姓名或地址..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all text-gray-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayElders.map((elder) => (
          <Link
            key={elder.id}
            to={`/elders/${elder.id}`}
            className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all p-5 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-primary-100 flex-shrink-0">
                {elder.photo ? (
                  <img
                    src={elder.photo}
                    alt={elder.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="text-primary-400" size={28} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                    {elder.name}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {genderLabels[elder.gender]} · {elder.age}岁
                  </span>
                </div>
                <span className="inline-block mt-1 px-2 py-0.5 bg-primary-50 text-primary-600 text-xs rounded-full">
                  {mobilityLabels[elder.mobility]}
                </span>
              </div>
              <ChevronRight
                className="text-gray-300 group-hover:text-primary-500 transition-colors"
                size={20}
              />
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                <span className="truncate">{elder.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={16} className="text-gray-400 flex-shrink-0" />
                <span>{elder.contactPhone}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {displayElders.length === 0 && (
        <div className="text-center py-16">
          <User className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">暂无匹配的老人档案</p>
        </div>
      )}
    </div>
  );
}
