import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import PlayerCard from "@/components/PlayerCard";
import PlayerForm from "@/components/PlayerForm";
import Modal from "@/components/Modal";
import type { Player } from "@/types";

export default function Players() {
  const { players, addPlayer, updatePlayer, deletePlayer } = usePlayerStore();
  const [keyword, setKeyword] = useState("");
  const [courageFilter, setCourageFilter] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Player | null>(null);

  const filtered = useMemo(() => {
    return players.filter((p) => {
      const matchKw =
        !keyword ||
        p.nickname.includes(keyword) ||
        p.contact.includes(keyword);
      const matchCourage = !courageFilter || p.courageLevel === courageFilter;
      return matchKw && matchCourage;
    });
  }, [players, keyword, courageFilter]);

  function handleSubmit(data: Omit<Player, "id" | "createdAt">) {
    if (editing) {
      updatePlayer(editing.id, data);
    } else {
      addPlayer(data);
    }
    setFormOpen(false);
    setEditing(null);
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex-1 relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            className="input pl-10"
            placeholder="搜索昵称或联系方式"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={courageFilter}
            onChange={(e) =>
              setCourageFilter(Number(e.target.value) as 0 | 1 | 2 | 3 | 4 | 5)
            }
            className="input !w-auto !py-2.5"
          >
            <option value={0}>全部胆量</option>
            {[1, 2, 3, 4, 5].map((l) => (
              <option key={l} value={l}>
                胆量 {l} 级
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="btn-primary shrink-0"
          >
            <Plus className="w-4 h-4" /> 新建玩家
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">👻</div>
          <div className="text-ink-300">
            {players.length === 0 ? "还没有玩家档案，快来创建一个吧" : "没有匹配的玩家"}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <PlayerCard
              key={p.id}
              player={p}
              onEdit={(player) => {
                setEditing(player);
                setFormOpen(true);
              }}
              onDelete={setConfirmDelete}
            />
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        title={editing ? "编辑玩家档案" : "新建玩家档案"}
      >
        <PlayerForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      </Modal>

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="确认删除"
        footer={
          <>
            <button onClick={() => setConfirmDelete(null)} className="btn-ghost">
              取消
            </button>
            <button
              onClick={() => {
                if (confirmDelete) deletePlayer(confirmDelete.id);
                setConfirmDelete(null);
              }}
              className="btn-danger"
            >
              删除
            </button>
          </>
        }
      >
        <div className="text-ink-200">
          确定要删除玩家 <b className="text-white">{confirmDelete?.nickname}</b> 吗？此操作无法撤销。
        </div>
      </Modal>
    </div>
  );
}
