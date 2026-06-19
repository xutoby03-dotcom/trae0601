import { useState, useMemo } from "react";
import { Plus, Filter } from "lucide-react";
import { useSessionStore } from "@/store/sessionStore";
import SessionCard from "@/components/SessionCard";
import SessionForm from "@/components/SessionForm";
import Modal from "@/components/Modal";
import type { GameSession, SessionStatus } from "@/types";

export default function Sessions() {
  const { sessions, addSession, updateSession, deleteSession } = useSessionStore();
  const [statusFilter, setStatusFilter] = useState<"all" | SessionStatus>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GameSession | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<GameSession | null>(null);

  const filtered = useMemo(() => {
    const list = [...sessions].sort(
      (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
    if (statusFilter === "all") return list;
    return list.filter((s) => s.status === statusFilter);
  }, [sessions, statusFilter]);

  function handleSubmit(
    data: Omit<GameSession, "id" | "createdAt" | "status">
  ) {
    if (editing) {
      updateSession(editing.id, data);
    } else {
      addSession(data);
    }
    setFormOpen(false);
    setEditing(null);
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-ink-400" />
          <div className="flex gap-1 flex-wrap">
            {[
              ["all", "全部"],
              ["pending", "待成团"],
              ["confirmed", "已成团"],
              ["completed", "已完成"],
              ["cancelled", "已取消"],
            ].map(([v, label]) => (
              <button
                key={v}
                onClick={() => setStatusFilter(v as any)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  statusFilter === v
                    ? "bg-ink-600 text-white shadow-glow"
                    : "bg-ink-900/60 text-ink-300 hover:bg-ink-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1" />
        <button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="btn-primary shrink-0"
        >
          <Plus className="w-4 h-4" /> 新建场次
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">🎭</div>
          <div className="text-ink-300">
            还没有场次，快来创建一场惊心动魄的密室之旅吧！
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <SessionCard
              key={s.id}
              session={s}
              onEdit={(ss) => {
                setEditing(ss);
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
        title={editing ? "编辑场次" : "新建场次"}
      >
        <SessionForm
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
                if (confirmDelete) deleteSession(confirmDelete.id);
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
          确定要删除场次 <b className="text-white">{confirmDelete?.theme}</b> 吗？该场次所有报名记录也会被删除。
        </div>
      </Modal>
    </div>
  );
}
