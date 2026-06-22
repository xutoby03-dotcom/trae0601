import { useState, useMemo } from "react";
import { List, Trash2, Filter, Search, Clock, Weight } from "lucide-react";
import { useKnotStore } from "@/store/useKnotStore";
import { formatTime, formatDate } from "@/utils/knotUtils";
import StatusBadge from "./StatusBadge";
import { KNOT_TYPES } from "@/types/knot";

export default function RecordList() {
  const { records, deleteRecord, knotTypes } = useKnotStore();
  const [filterStudent, setFilterStudent] = useState("");
  const [filterKnot, setFilterKnot] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const allStudents = useMemo(() => {
    return [...new Set(records.map((r) => r.studentName))].sort();
  }, [records]);

  const allKnotTypes = useMemo(() => {
    return [...new Set([...KNOT_TYPES, ...records.map((r) => r.knotType)])];
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (filterStudent && r.studentName !== filterStudent) return false;
      if (filterKnot && r.knotType !== filterKnot) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          r.studentName.toLowerCase().includes(query) ||
          r.knotType.toLowerCase().includes(query) ||
          r.notes.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [records, filterStudent, filterKnot, searchQuery]);

  const hasIssues = (record: typeof records[0]) => {
    return record.slipped || record.capsized || record.sheathWear;
  };

  const getStatusType = (record: typeof records[0]) => {
    if (record.slipped) return "danger";
    if (record.capsized || record.sheathWear) return "warning";
    return "success";
  };

  const getStatusText = (record: typeof records[0]) => {
    if (record.slipped) return "滑脱";
    if (record.capsized) return "翻结";
    if (record.sheathWear) return "磨损";
    return "通过";
  };

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这条记录吗？")) {
      deleteRecord(id);
    }
  };

  const clearFilters = () => {
    setFilterStudent("");
    setFilterKnot("");
    setSearchQuery("");
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-olive-100 overflow-hidden flex flex-col h-full">
      <div className="bg-gradient-to-r from-olive-700 to-olive-600 px-6 py-4">
        <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
          <List className="w-5 h-5" />
          练习记录
          <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm">
            {filteredRecords.length}
          </span>
        </h2>
      </div>

      <div className="p-4 border-b border-olive-100 bg-olive-50/30 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索学员、绳结或备注..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-olive-200 rounded-lg bg-white focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <select
              value={filterStudent}
              onChange={(e) => setFilterStudent(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-olive-200 rounded-lg bg-white focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all text-olive-700"
            >
              <option value="">全部学员</option>
              {allStudents.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <select
              value={filterKnot}
              onChange={(e) => setFilterKnot(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-olive-200 rounded-lg bg-white focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all text-olive-700"
            >
              <option value="">全部绳结</option>
              {allKnotTypes.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
          {(filterStudent || filterKnot || searchQuery) && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-olive-600 hover:text-olive-800 hover:bg-olive-100 rounded-lg transition-all"
            >
              <Filter className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-olive-400">
            <List className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">暂无记录</p>
            <p className="text-xs mt-1">在左侧表单添加第一条记录</p>
          </div>
        ) : (
          <div className="divide-y divide-olive-100">
            {filteredRecords.map((record, index) => (
              <div
                key={record.id}
                className={`p-4 hover:bg-olive-50/50 transition-colors ${
                  index === 0 ? "animate-fadeIn" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-olive-800">
                        {record.studentName}
                      </span>
                      <span className="text-olive-400">·</span>
                      <span className="font-medium text-earth-700">
                        {record.knotType}
                      </span>
                      <StatusBadge
                        type={getStatusType(record)}
                        pulse={hasIssues(record)}
                      >
                        {getStatusText(record)}
                      </StatusBadge>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-olive-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(record.tieTimeSeconds)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Weight className="w-3 h-3" />
                        {record.testWeight}kg
                      </span>
                      <span>
                        {record.ropeDiameter}mm {record.ropeMaterial}
                      </span>
                      {record.retryCount > 0 && (
                        <span className="text-rope-600">
                          复打 {record.retryCount} 次
                        </span>
                      )}
                    </div>

                    {record.notes && (
                      <p className="text-sm text-olive-600 bg-olive-50 rounded-lg px-3 py-1.5">
                        {record.notes}
                      </p>
                    )}

                    <p className="text-xs text-olive-400 mt-2">
                      {formatDate(record.createdAt)}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(record.id)}
                    className="p-2 text-olive-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="删除记录"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {(record.slipped || record.capsized || record.sheathWear) && (
                  <div className="flex gap-2 mt-2">
                    {record.slipped && (
                      <StatusBadge type="danger">滑脱</StatusBadge>
                    )}
                    {record.capsized && (
                      <StatusBadge type="warning">翻结</StatusBadge>
                    )}
                    {record.sheathWear && (
                      <StatusBadge type="warning">绳皮磨损</StatusBadge>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
