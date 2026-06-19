import { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Coins,
  Skull,
  Plus,
  UserPlus,
  CheckCircle2,
  Circle,
  DollarSign,
  LogOut,
  RotateCcw,
  AlertTriangle,
  Info,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { useSessionStore } from "@/store/sessionStore";
import { usePlayerStore } from "@/store/playerStore";
import Modal from "@/components/Modal";
import { formatDateTime, getRelativeDate } from "@/utils";
import { courageColors, courageLabels } from "@/data/mock";
import type { Player, Registration, RegistrationCheck } from "@/types";

export default function SessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = useSessionStore((s) => s.getSessionById(id ?? ""));
  const {
    getRegistrationsBySession,
    getActiveRegistrationsBySession,
    getCapacityInfo,
    addRegistration,
    markPaid,
    markCheckedIn,
    markWithdrew,
    assignSubstitute,
    checkRegistration,
    updateSession,
  } = useSessionStore();
  const { players, getPlayerById } = usePlayerStore();

  const [signUpOpen, setSignUpOpen] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [substituteFor, setSubstituteFor] = useState<string | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<{
    reg: Registration;
    action: "paid" | "checkedIn" | "withdrew";
  } | null>(null);

  const registrations = useMemo(
    () => getRegistrationsBySession(id ?? ""),
    [id, getRegistrationsBySession]
  );

  const activeRegistrations = useMemo(
    () => getActiveRegistrationsBySession(id ?? ""),
    [id, getActiveRegistrationsBySession]
  );

  const capacity = useMemo(
    () => getCapacityInfo(id ?? ""),
    [id, getCapacityInfo]
  );

  const check: RegistrationCheck = useMemo(
    () => checkRegistration(id ?? "", selectedPlayers),
    [id, selectedPlayers, checkRegistration]
  );

  const availablePlayers = useMemo(() => {
    const activeIds = new Set(activeRegistrations.map((r) => r.playerId));
    return players.filter((p) => !activeIds.has(p.id));
  }, [players, activeRegistrations]);

  if (!session) {
    return (
      <div className="card text-center py-16">
        <div className="text-6xl mb-4">🫥</div>
        <div className="text-ink-300 mb-4">找不到该场次</div>
        <Link to="/sessions" className="btn-primary inline-flex">
          <ArrowLeft className="w-4 h-4" /> 返回场次列表
        </Link>
      </div>
    );
  }

  function toggleSelectPlayer(pid: string) {
    setSelectedPlayers((prev) =>
      prev.includes(pid) ? prev.filter((x) => x !== pid) : [...prev, pid]
    );
  }

  function doSignUp() {
    selectedPlayers.forEach((pid) => {
      if (substituteFor) {
        assignSubstitute(session.id, substituteFor, pid);
      } else {
        addRegistration(session.id, pid);
      }
    });
    setSelectedPlayers([]);
    setSubstituteFor(null);
    setSignUpOpen(false);
  }

  function openSubstitute(reg: Registration) {
    setSubstituteFor(reg.id);
    setSignUpOpen(true);
  }

  function confirmStatusOk() {
    if (!confirmStatus) return;
    const { reg, action } = confirmStatus;
    if (action === "paid") markPaid(reg.id);
    else if (action === "checkedIn") markCheckedIn(reg.id);
    else if (action === "withdrew") markWithdrew(reg.id);
    setConfirmStatus(null);
  }

  const percent = Math.min(
    100,
    (capacity.currentCount / session.maxPlayers) * 100
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/sessions")}
          className="btn-ghost !px-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-white truncate">
              {session.theme}
            </h2>
            {session.isHorror && (
              <span className="chip bg-glow-rose/25 text-glow-rose">
                <Skull className="w-3 h-3" /> 恐怖本
              </span>
            )}
          </div>
          <div className="text-ink-400 text-sm mt-1 flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {session.storeName}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDateTime(session.scheduledAt)} · {getRelativeDate(session.scheduledAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-ink-600/30 flex items-center justify-center">
            <Clock className="w-6 h-6 text-ink-300" />
          </div>
          <div>
            <div className="text-sm text-ink-400">时长</div>
            <div className="font-display text-xl font-bold text-white">
              {session.durationMinutes} 分钟
            </div>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-glow-green/15 flex items-center justify-center">
            <Coins className="w-6 h-6 text-glow-green" />
          </div>
          <div>
            <div className="text-sm text-ink-400">单价</div>
            <div className="font-display text-xl font-bold text-white">
              ¥{session.price} / 人
            </div>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-glow-amber/15 flex items-center justify-center">
            <Users className="w-6 h-6 text-glow-amber" />
          </div>
          <div>
            <div className="text-sm text-ink-400">人数范围</div>
            <div className="font-display text-xl font-bold text-white">
              {session.minPlayers} - {session.maxPlayers} 人
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="font-display text-lg font-bold text-white mb-1">
              拼场进度
            </h3>
            <div className="text-sm text-ink-400">
              难度 {session.difficulty} 级 · {session.type}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              {capacity.overflow > 0 ? (
                <span className="chip bg-glow-rose/25 text-glow-rose">
                  <AlertTriangle className="w-3 h-3" />
                  超员 +{capacity.overflow}
                </span>
              ) : !capacity.enough ? (
                <span className="chip bg-glow-amber/25 text-glow-amber">
                  <Info className="w-3 h-3" />
                  还差 {capacity.gap} 人成团
                </span>
              ) : (
                <span className="chip bg-glow-green/25 text-glow-green">
                  <Check className="w-3 h-3" />
                  已达最低人数
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setSubstituteFor(null);
                setSignUpOpen(true);
              }}
              className="btn-primary"
            >
              <UserPlus className="w-4 h-4" /> 添加玩家
            </button>
          </div>
        </div>

        <div className="progress-bar mb-1">
          <div
            className={`progress-fill ${
              capacity.overflow
                ? "bg-glow-rose"
                : capacity.enough
                ? "bg-glow-green"
                : "bg-glow-amber"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-ink-400">
          <span>0</span>
          <span>
            最低 {session.minPlayers} · 当前 {capacity.currentCount} · 最多{" "}
            {session.maxPlayers}
          </span>
          <span>{session.maxPlayers}</span>
        </div>
      </div>

      <div className="card">
        <h3 className="font-display text-lg font-bold text-white mb-4">
          报名名单（{activeRegistrations.length} 人）
        </h3>
        {activeRegistrations.length === 0 ? (
          <div className="text-center py-10 text-ink-400">
            还没有人报名，点击右上角「添加玩家」开始拼场
          </div>
        ) : (
          <div className="space-y-2">
            {activeRegistrations.map((reg) => {
              const p = getPlayerById(reg.playerId);
              if (!p) return null;
              return (
                <PlayerRow
                  key={reg.id}
                  player={p}
                  reg={reg}
                  onMarkPaid={() =>
                    setConfirmStatus({ reg, action: "paid" })
                  }
                  onCheckIn={() =>
                    setConfirmStatus({ reg, action: "checkedIn" })
                  }
                  onWithdraw={() =>
                    setConfirmStatus({ reg, action: "withdrew" })
                  }
                  onSubstitute={() => openSubstitute(reg)}
                  getPlayerById={getPlayerById}
                />
              );
            })}
          </div>
        )}
      </div>

      {registrations.filter((r) => r.status === "withdrew").length > 0 && (
        <div className="card opacity-75">
          <h3 className="font-display text-lg font-bold text-ink-400 mb-4">
            已退出（{registrations.filter((r) => r.status === "withdrew").length} 人）
          </h3>
          <div className="space-y-2">
            {registrations
              .filter((r) => r.status === "withdrew")
              .map((reg) => {
                const p = getPlayerById(reg.playerId);
                if (!p) return null;
                return (
                  <div
                    key={reg.id}
                    className="flex items-center gap-3 bg-ink-950/40 rounded-xl px-4 py-3 border border-ink-800/50 line-through text-ink-500"
                  >
                    <div className="w-10 h-10 rounded-lg bg-ink-900 flex items-center justify-center text-xl grayscale">
                      {p.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{p.nickname}</div>
                      <div className="text-xs">已临时退出</div>
                    </div>
                    <button
                      onClick={() => openSubstitute(reg)}
                      className="btn-ghost !py-1.5 !px-3 text-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> 安排替补
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      <Modal
        open={signUpOpen}
        onClose={() => {
          setSignUpOpen(false);
          setSelectedPlayers([]);
          setSubstituteFor(null);
        }}
        title={
          substituteFor ? "安排替补玩家" : "添加玩家到场次"
        }
        footer={
          <>
            <button
              onClick={() => {
                setSignUpOpen(false);
                setSelectedPlayers([]);
                setSubstituteFor(null);
              }}
              className="btn-ghost"
            >
              取消
            </button>
            <button
              onClick={doSignUp}
              disabled={selectedPlayers.length === 0}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              确认添加（{selectedPlayers.length}）
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {session.isHorror && (
            <div className="chip bg-glow-rose/20 text-glow-rose">
              <Skull className="w-3 h-3" /> 本场为恐怖本，系统将自动检测胆量冲突
            </div>
          )}

          {selectedPlayers.length > 0 && (
            <div className="space-y-2 bg-ink-950/60 rounded-xl p-3 border border-ink-800">
              <div className="text-xs text-ink-400 font-medium mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-glow-amber" />
                智能提示
              </div>
              <div className="flex items-center gap-2">
                {check.capacity.enough ? (
                  <span className="chip bg-glow-green/20 text-glow-green">
                    <Check className="w-3 h-3" /> 人数够了
                  </span>
                ) : (
                  <span className="chip bg-glow-amber/20 text-glow-amber">
                    <Info className="w-3 h-3" /> 还差 {check.capacity.gap} 人
                    {check.needCarpool && "，建议开启拼车"}
                  </span>
                )}
                {check.capacity.overflow > 0 && (
                  <span className="chip bg-glow-rose/20 text-glow-rose">
                    <AlertTriangle className="w-3 h-3" /> 超员{" "}
                    {check.capacity.overflow} 人
                  </span>
                )}
              </div>
              {check.horrorConflicts.length > 0 && (
                <div className="mt-2 space-y-1">
                  {check.horrorConflicts.map((c) => (
                    <div
                      key={c.playerId + c.reason}
                      className={`text-xs flex items-start gap-1.5 ${
                        c.severity === "danger"
                          ? "text-glow-rose"
                          : "text-glow-amber"
                      }`}
                    >
                      {c.severity === "danger" ? (
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      ) : (
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      )}
                      <span>
                        <b>{c.playerName}</b>：{c.reason}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {check.npcReductionSuggestion !== "none" && (
                <div className="text-xs text-glow-amber mt-2 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  建议 NPC 惊吓程度：
                  <b>
                    {check.npcReductionSuggestion === "mild"
                      ? "轻微减量"
                      : check.npcReductionSuggestion === "moderate"
                      ? "中度减量"
                      : "大幅减量"}
                  </b>
                </div>
              )}
            </div>
          )}

          <div>
            <div className="text-sm text-ink-300 mb-2">
              选择要添加的玩家（可多选）：
            </div>
            {availablePlayers.length === 0 ? (
              <div className="text-center py-8 text-ink-400 text-sm">
                所有玩家都已报名或已退出
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {availablePlayers.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => toggleSelectPlayer(p.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                      selectedPlayers.includes(p.id)
                        ? "bg-ink-600/40 border border-ink-500 shadow-glow"
                        : "bg-ink-950/60 border border-ink-800 hover:border-ink-600"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-ink-800 flex items-center justify-center text-lg">
                      {p.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm flex items-center gap-2">
                        {p.nickname}
                        {p.isNewbie && (
                          <span className="chip !py-0 bg-glow-amber/20 text-glow-amber text-[10px]">
                            新手
                          </span>
                        )}
                      </div>
                      <div className={`chip mt-0.5 !py-0 ${courageColors[p.courageLevel]}`}>
                        {courageLabels[p.courageLevel]}
                      </div>
                    </div>
                    {selectedPlayers.includes(p.id) ? (
                      <CheckCircle2 className="w-5 h-5 text-glow-green shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-ink-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        open={!!confirmStatus}
        onClose={() => setConfirmStatus(null)}
        title={
          confirmStatus?.action === "paid"
            ? "确认已付款"
            : confirmStatus?.action === "checkedIn"
            ? "确认到场签到"
            : "确认临时退出"
        }
        footer={
          <>
            <button onClick={() => setConfirmStatus(null)} className="btn-ghost">
              取消
            </button>
            <button
              onClick={confirmStatusOk}
              className={
                confirmStatus?.action === "withdrew" ? "btn-danger" : "btn-success"
              }
            >
              确认
            </button>
          </>
        }
      >
        {confirmStatus && (
          <div className="text-ink-200">
            {confirmStatus.action === "paid" && (
              <>
                确认玩家 <b className="text-white">
                  {getPlayerById(confirmStatus.reg.playerId)?.nickname}
                </b>{" "}
                已支付 ¥{session.price}？
              </>
            )}
            {confirmStatus.action === "checkedIn" && (
              <>
                确认玩家 <b className="text-white">
                  {getPlayerById(confirmStatus.reg.playerId)?.nickname}
                </b>{" "}
                已到场签到？
              </>
            )}
            {confirmStatus.action === "withdrew" && (
              <>
                玩家 <b className="text-white">
                  {getPlayerById(confirmStatus.reg.playerId)?.nickname}
                </b>{" "}
                要临时退出吗？你可以之后再安排替补。
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

interface RowProps {
  player: Player;
  reg: Registration;
  onMarkPaid: () => void;
  onCheckIn: () => void;
  onWithdraw: () => void;
  onSubstitute: () => void;
  getPlayerById: (id: string) => Player | undefined;
}

function PlayerRow({
  player,
  reg,
  onMarkPaid,
  onCheckIn,
  onWithdraw,
  onSubstitute,
  getPlayerById,
}: RowProps) {
  const statusChip =
    reg.status === "checkedIn"
      ? { label: "已签到", cls: "bg-glow-green/25 text-glow-green" }
      : reg.isSubstitute
      ? { label: "替补", cls: "bg-ink-600/50 text-ink-200" }
      : { label: "已报名", cls: "bg-ink-700/60 text-ink-300" };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-ink-950/50 rounded-xl px-4 py-3 border border-ink-800 hover:border-ink-600 transition-all">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-11 h-11 rounded-xl bg-ink-800 flex items-center justify-center text-2xl shrink-0">
          {player.avatar}
        </div>
        <div className="min-w-0">
          <div className="font-medium text-white flex items-center gap-2 flex-wrap">
            {player.nickname}
            <span className={`chip ${statusChip.cls}`}>{statusChip.label}</span>
            <span className={`chip ${courageColors[player.courageLevel]}`}>
              胆量{player.courageLevel}级
            </span>
            {player.isNewbie && (
              <span className="chip bg-glow-amber/20 text-glow-amber">新手</span>
            )}
            {reg.isSubstitute && reg.substituteOfId && (
              <span className="chip bg-ink-700/60 text-ink-300">
                替补 {getPlayerById(reg.substituteOfId)?.nickname}
              </span>
            )}
          </div>
          {player.tabooThemes.length > 0 && (
            <div className="text-xs text-ink-400 mt-1 truncate">
              忌讳：{player.tabooThemes.join("、")}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap shrink-0">
        {!reg.isPaid ? (
          <button onClick={onMarkPaid} className="btn-warning !py-1.5 !px-3 text-sm">
            <DollarSign className="w-4 h-4" /> 标记已付款
          </button>
        ) : (
          <span className="chip bg-glow-green/20 text-glow-green">
            <Check className="w-3 h-3" /> 已付 ¥
          </span>
        )}
        {reg.status !== "checkedIn" && (
          <button onClick={onCheckIn} className="btn-success !py-1.5 !px-3 text-sm">
            <CheckCircle2 className="w-4 h-4" /> 签到
          </button>
        )}
        <button onClick={onWithdraw} className="btn-danger !py-1.5 !px-3 text-sm">
          <LogOut className="w-4 h-4" /> 退出
        </button>
        {!reg.isSubstitute && (
          <button onClick={onSubstitute} className="btn-ghost !py-1.5 !px-3 text-sm">
            <RotateCcw className="w-4 h-4" /> 换替补
          </button>
        )}
      </div>
    </div>
  );
}
