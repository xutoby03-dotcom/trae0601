import { Link } from "react-router-dom";
import { Plus, Cat, Dog } from "lucide-react";
import { usePetStore } from "../store/petStore";
import PetCard from "../components/PetCard";
import ReminderSummaryCards from "../components/ReminderSummaryCards";

export default function HomePage() {
  const pets = usePetStore((s) => s.pets);

  return (
    <div className="container py-8 pb-28 space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="font-display text-3xl font-bold text-ink-800">
          你好，铲屎官 👋
        </h1>
        <p className="text-ink-500 mt-1">今天也要记得照顾毛孩子的健康哦</p>
      </div>

      <ReminderSummaryCards />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">我的宠物</h2>
          <Link to="/pet/new" className="btn-primary text-sm py-2 px-4">
            <Plus className="w-4 h-4" />
            添加宠物
          </Link>
        </div>

        {pets.length === 0 ? (
          <div className="card p-12 text-center animate-fade-in-up">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-warm-50 flex items-center justify-center mb-4">
              <div className="flex -space-x-2">
                <Cat className="w-8 h-8 text-warm-400" />
                <Dog className="w-8 h-8 text-mint-500" />
              </div>
            </div>
            <h3 className="font-display text-xl font-bold text-ink-700">
              还没有添加宠物
            </h3>
            <p className="text-ink-400 mt-1 text-sm">
              添加第一只宠物，开启驱虫管理之旅
            </p>
            <Link to="/pet/new" className="btn-primary mt-5">
              <Plus className="w-4 h-4" />
              添加宠物
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pets.map((pet, i) => (
              <PetCard key={pet.id} pet={pet} index={i} />
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 hidden md:block">
        <div className="card px-2 py-2 flex items-center gap-1 shadow-soft-lg">
          <Link
            to="/pet/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-ink-500 hover:bg-ink-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加宠物
          </Link>
          <div className="w-px h-6 bg-ink-100" />
          {pets.length > 0 && (
            <Link
              to={`/pet/${pets[0].id}/deworm/new`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-warm-500 text-white hover:bg-warm-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              记录驱虫
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
