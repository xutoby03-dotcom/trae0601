import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Phone,
  StickyNote,
  User,
  Edit3,
  X,
  Check,
} from 'lucide-react';
import { useTripStore } from '@/store/useTripStore';
import DocumentRow from '@/components/DocumentRow';
import DocumentForm from '@/components/DocumentForm';
import { Document } from '@/types';
import { getPersonCompletionRate } from '@/store/useTripStore';
import ProgressRing from '@/components/ProgressRing';

const AVATAR_OPTIONS = ['👨', '👩', '👧', '🧑', '👴', '👵', '🧒', '👦', '👱', '🧔'];

export default function PersonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    persons,
    documents,
    updatePerson,
    addDocument,
    updateDocument,
    removeDocument,
  } = useTripStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);

  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [editingEmergency, setEditingEmergency] = useState(false);
  const [tempEmergency, setTempEmergency] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState('');

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const person = persons.find((p) => p.id === id);
  const personDocs = documents.filter((d) => d.personId === id);
  const completionRate = id ? getPersonCompletionRate(id, documents) : 0;

  if (!person) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">未找到该人员</p>
          <button
            onClick={() => navigate('/')}
            className="text-slate-600 hover:text-slate-800"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const handleSaveName = () => {
    if (tempName.trim()) {
      updatePerson(person.id, { name: tempName.trim() });
    }
    setEditingName(false);
  };

  const handleSaveEmergency = () => {
    updatePerson(person.id, { emergencyContact: tempEmergency.trim() });
    setEditingEmergency(false);
  };

  const handleSaveNotes = () => {
    updatePerson(person.id, { notes: tempNotes.trim() });
    setEditingNotes(false);
  };

  const handleAddDocument = (data: Omit<Document, 'id'>) => {
    addDocument(data);
    setShowAddForm(false);
  };

  const handleUpdateDocument = (data: Omit<Document, 'id'>) => {
    if (editingDoc) {
      updateDocument(editingDoc.id, data);
    }
    setEditingDoc(null);
  };

  const handleDeleteDocument = (docId: string) => {
    if (confirm('确定要删除这个证件吗？')) {
      removeDocument(docId);
    }
  };

  const handleAvatarChange = (avatar: string) => {
    updatePerson(person.id, { avatar });
    setShowAvatarPicker(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部 */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-bold">人员详情</h1>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* 人员信息卡片 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
          <div className="flex items-start gap-6">
            {/* 头像 */}
            <div className="relative">
              <button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-4xl hover:bg-slate-200 transition-colors"
              >
                {person.avatar || <User size={32} className="text-gray-400" />}
              </button>
              {showAvatarPicker && (
                <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-xl shadow-lg border border-gray-100 z-10">
                  <p className="text-xs text-gray-500 mb-2">选择头像</p>
                  <div className="grid grid-cols-5 gap-2">
                    {AVATAR_OPTIONS.map((avatar) => (
                      <button
                        key={avatar}
                        onClick={() => handleAvatarChange(avatar)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                          person.avatar === avatar
                            ? 'bg-slate-200 ring-2 ring-slate-400'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 信息 */}
            <div className="flex-1">
              {/* 姓名 */}
              {editingName ? (
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
                    autoFocus
                    className="text-2xl font-bold text-gray-800 border-b-2 border-slate-500 focus:outline-none bg-transparent w-full max-w-xs"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 text-emerald-500 hover:bg-emerald-50 rounded"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => setEditingName(false)}
                    className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {person.name}
                  </h2>
                  <button
                    onClick={() => {
                      setTempName(person.name);
                      setEditingName(true);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Edit3 size={16} />
                  </button>
                </div>
              )}

              {/* 紧急联系人 */}
              {editingEmergency ? (
                <div className="flex items-center gap-2 mb-3">
                  <Phone size={14} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={tempEmergency}
                    onChange={(e) => setTempEmergency(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveEmergency()}
                    placeholder="紧急联系人"
                    autoFocus
                    className="text-sm text-gray-600 border-b border-slate-400 focus:outline-none bg-transparent flex-1"
                  />
                  <button
                    onClick={handleSaveEmergency}
                    className="p-1 text-emerald-500"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => setEditingEmergency(false)}
                    className="p-1 text-gray-400"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setTempEmergency(person.emergencyContact);
                    setEditingEmergency(true);
                  }}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-3"
                >
                  <Phone size={14} />
                  <span>{person.emergencyContact || '添加紧急联系人'}</span>
                  <Edit3 size={12} className="opacity-50" />
                </button>
              )}

              {/* 备注 */}
              {editingNotes ? (
                <div className="mb-3">
                  <textarea
                    value={tempNotes}
                    onChange={(e) => setTempNotes(e.target.value)}
                    placeholder="备注信息"
                    rows={2}
                    autoFocus
                    className="w-full text-sm text-gray-600 border border-gray-200 rounded-lg p-2 focus:border-slate-400 focus:outline-none"
                  />
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={handleSaveNotes}
                      className="text-xs text-emerald-500 hover:text-emerald-600"
                    >
                      确定
                    </button>
                    <button
                      onClick={() => setEditingNotes(false)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setTempNotes(person.notes);
                    setEditingNotes(true);
                  }}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <StickyNote size={14} />
                  <span>{person.notes || '添加备注'}</span>
                  <Edit3 size={12} className="opacity-50" />
                </button>
              )}
            </div>

            {/* 完成率 */}
            <div className="text-center">
              <ProgressRing
                progress={completionRate}
                size={80}
                strokeWidth={6}
                color={completionRate === 1 ? '#10b981' : '#f97316'}
                label="完成度"
              />
            </div>
          </div>
        </div>

        {/* 证件列表 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-800">
              证件列表
              <span className="text-sm font-normal text-gray-400 ml-2">
                ({personDocs.length}个)
              </span>
            </h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white text-sm rounded-xl hover:bg-slate-900 transition-colors"
            >
              <Plus size={16} />
              添加证件
            </button>
          </div>

          {personDocs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User size={28} className="text-gray-300" />
              </div>
              <p className="text-gray-500 mb-2">还没有添加证件</p>
              <p className="text-sm text-gray-400 mb-4">
                点击上方按钮添加身份证、护照等证件信息
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="text-slate-600 hover:text-slate-800 text-sm font-medium"
              >
                + 添加第一个证件
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {personDocs.map((doc) => (
                <DocumentRow
                  key={doc.id}
                  document={doc}
                  mode="detail"
                  showEdit={true}
                  onEdit={() => setEditingDoc(doc)}
                  onDelete={() => handleDeleteDocument(doc.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* 返回按钮 */}
        <button
          onClick={() => navigate('/')}
          className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
        >
          返回首页
        </button>
      </main>

      {/* 添加证件表单 */}
      {showAddForm && person && (
        <DocumentForm
          personId={person.id}
          onSubmit={handleAddDocument}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* 编辑证件表单 */}
      {editingDoc && (
        <DocumentForm
          personId={editingDoc.personId}
          document={editingDoc}
          onSubmit={handleUpdateDocument}
          onCancel={() => setEditingDoc(null)}
        />
      )}
    </div>
  );
}
