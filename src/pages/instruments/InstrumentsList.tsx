import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Wrench,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { useInstrumentStore } from "@/store/instrumentStore";
import { useUserStore } from "@/store/userStore";
import { INSTRUMENT_TYPES, CLASSROOMS } from "@/types";
import InstrumentFormModal from "./InstrumentFormModal";
import type { Instrument } from "@/types";

const PAGE_SIZE = 8;

export default function InstrumentsList() {
  const instruments = useInstrumentStore((s) => s.instruments);
  const searchKeyword = useInstrumentStore((s) => s.searchKeyword);
  const filterClassroom = useInstrumentStore((s) => s.filterClassroom);
  const filterType = useInstrumentStore((s) => s.filterType);
  const setSearchKeyword = useInstrumentStore((s) => s.setSearchKeyword);
  const setFilterClassroom = useInstrumentStore((s) => s.setFilterClassroom);
  const setFilterType = useInstrumentStore((s) => s.setFilterType);
  const deleteInstrument = useInstrumentStore((s) => s.deleteInstrument);
  const getFilteredInstruments = useInstrumentStore((s) => s.getFilteredInstruments);

  const getUserById = useUserStore((s) => s.getUserById);

  const [showModal, setShowModal] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState<Instrument | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Instrument | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredInstruments = useMemo(() => {
    return getFilteredInstruments();
  }, [instruments, searchKeyword, filterClassroom, filterType, getFilteredInstruments]);

  const totalPages = Math.max(1, Math.ceil(filteredInstruments.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedInstruments = filteredInstruments.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const handleAdd = () => {
    setEditingInstrument(null);
    setShowModal(true);
  };

  const handleEdit = (instrument: Instrument) => {
    setEditingInstrument(instrument);
    setShowModal(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteInstrument(deleteTarget.id);
      setDeleteTarget(null);
      if (
        paginatedInstruments.length === 1 &&
        currentPage > 1
      ) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingInstrument(null);
  };

  const clearFilters = () => {
    setSearchKeyword("");
    setFilterClassroom(null);
    setFilterType(null);
    setCurrentPage(1);
  };

  const hasFilters = searchKeyword || filterClassroom || filterType;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-walnut-800">
            乐器档案
          </h1>
          <p className="text-sm text-walnut-400 mt-1">
            共 {filteredInstruments.length} 件乐器
            {hasFilters && (
              <span className="ml-2 text-walnut-500">
                （已筛选，全部 {instruments.length} 件）
              </span>
            )}
          </p>
        </div>
        <button onClick={handleAdd} className="btn-primary">
          <Plus className="w-4 h-4" />
          新增乐器
        </button>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-walnut-400" />
            <input
              type="text"
              placeholder="搜索编号、类型、品牌、教室..."
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setCurrentPage(1);
              }}
              className="input pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-walnut-500" />
            <select
              value={filterType || ""}
              onChange={(e) => {
                setFilterType(e.target.value || null);
                setCurrentPage(1);
              }}
              className="input w-40"
            >
              <option value="">全部类型</option>
              {INSTRUMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select
              value={filterClassroom || ""}
              onChange={(e) => {
                setFilterClassroom(e.target.value || null);
                setCurrentPage(1);
              }}
              className="input w-52"
            >
              <option value="">全部教室</option>
              {CLASSROOMS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="btn-ghost !px-3 !py-2.5"
                title="清除筛选"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-walnut-50/60 border-b border-walnut-100">
                <th className="text-left py-4 px-5 text-xs font-medium text-walnut-500 uppercase tracking-wider">
                  乐器
                </th>
                <th className="text-left py-4 px-5 text-xs font-medium text-walnut-500 uppercase tracking-wider">
                  编号
                </th>
                <th className="text-left py-4 px-5 text-xs font-medium text-walnut-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="text-left py-4 px-5 text-xs font-medium text-walnut-500 uppercase tracking-wider">
                  品牌
                </th>
                <th className="text-left py-4 px-5 text-xs font-medium text-walnut-500 uppercase tracking-wider">
                  存放教室
                </th>
                <th className="text-left py-4 px-5 text-xs font-medium text-walnut-500 uppercase tracking-wider">
                  责任老师
                </th>
                <th className="text-right py-4 px-5 text-xs font-medium text-walnut-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedInstruments.map((ins) => {
                const teacher = getUserById(ins.teacherId);
                return (
                  <tr
                    key={ins.id}
                    className="border-b border-walnut-50 hover:bg-walnut-50/40 transition-colors last:border-b-0"
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={ins.photo}
                            alt={ins.type}
                            className="w-14 h-14 rounded-xl object-cover border-2 border-walnut-100 shadow-sm"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-mono text-sm font-medium text-walnut-700">
                        {ins.id}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-walnut-100 text-walnut-700">
                        {ins.type}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="text-sm text-walnut-700">
                        {ins.brand}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="text-sm text-walnut-600">
                        {ins.classroom}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        {teacher?.avatar && (
                          <img
                            src={teacher.avatar}
                            alt={teacher.name}
                            className="w-7 h-7 rounded-full object-cover border border-walnut-100"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-walnut-800">
                            {teacher?.name || "-"}
                          </div>
                          {teacher?.phone && (
                            <div className="text-xs text-walnut-400">
                              {teacher.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(ins)}
                          className="p-2 rounded-lg text-walnut-500 hover:bg-walnut-100 hover:text-walnut-700 transition-colors"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                          title="报修"
                        >
                          <Wrench className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(ins)}
                          className="p-2 rounded-lg text-brick-600 hover:bg-brick-50 hover:text-brick-700 transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {paginatedInstruments.length === 0 && (
            <div className="py-16 text-center">
              <Filter className="w-12 h-12 text-walnut-200 mx-auto mb-3" />
              <p className="text-walnut-400">
                {hasFilters
                  ? "没有找到匹配的乐器，请调整筛选条件"
                  : "暂无乐器数据"}
              </p>
            </div>
          )}
        </div>

        {filteredInstruments.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-walnut-100 bg-walnut-50/30">
            <p className="text-sm text-walnut-500">
              显示{" "}
              <span className="font-medium text-walnut-700">
                {(safePage - 1) * PAGE_SIZE + 1}
              </span>
              {" - "}
              <span className="font-medium text-walnut-700">
                {Math.min(safePage * PAGE_SIZE, filteredInstruments.length)}
              </span>
              {" "}条，共{" "}
              <span className="font-medium text-walnut-700">
                {filteredInstruments.length}
              </span>
              {" "}条
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-2 rounded-lg text-walnut-500 hover:bg-walnut-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        page === safePage
                          ? "bg-walnut-600 text-white shadow-md"
                          : "text-walnut-600 hover:bg-walnut-100"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={safePage === totalPages}
                className="p-2 rounded-lg text-walnut-500 hover:bg-walnut-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <InstrumentFormModal
          editingInstrument={editingInstrument}
          onClose={handleCloseModal}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-brick-500/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-brick-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-walnut-800">
                    确认删除乐器？
                  </h3>
                  <p className="text-sm text-walnut-500 mt-2">
                    即将删除乐器{" "}
                    <span className="font-medium text-walnut-700">
                      {deleteTarget.type}（{deleteTarget.brand}）
                    </span>
                    ，编号为{" "}
                    <span className="font-mono text-walnut-700">
                      {deleteTarget.id}
                    </span>
                    。此操作无法撤销，是否继续？
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-walnut-50/60 border-t border-walnut-100">
              <button
                onClick={() => setDeleteTarget(null)}
                className="btn-ghost"
              >
                取消
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="btn-danger"
              >
                <Trash2 className="w-4 h-4" />
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
