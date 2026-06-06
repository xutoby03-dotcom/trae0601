import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  BookOpen,
  Calendar,
  Smartphone,
  Feather,
  Mail,
  FileText,
  Bell
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { templates, categories } from '../../utils/templates';

const iconMap: Record<string, React.ReactNode> = {
  'message-square': <MessageSquare size={24} />,
  'book-open': <BookOpen size={24} />,
  'calendar': <Calendar size={24} />,
  'smartphone': <Smartphone size={24} />,
  'feather': <Feather size={24} />,
  'mail': <Mail size={24} />,
  'file-text': <FileText size={24} />,
  'bell': <Bell size={24} />
};

const categoryColors: Record<string, string> = {
  '写作': 'bg-blue-100 text-blue-700',
  '工作': 'bg-purple-100 text-purple-700',
  '新媒体': 'bg-green-100 text-green-700',
  '创作': 'bg-orange-100 text-orange-700',
  '办公': 'bg-gray-100 text-gray-700',
  '求职': 'bg-red-100 text-red-700'
};

const TemplateModal: React.FC = () => {
  const { isTemplateModalOpen, toggleTemplateModal, createNewArticle } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('全部');

  if (!isTemplateModalOpen) return null;

  const filteredTemplates = selectedCategory === '全部'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  const handleSelectTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      createNewArticle(template.content, template.name);
      toggleTemplateModal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => toggleTemplateModal(false)}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">选择模板</h2>
            <p className="text-sm text-gray-500 mt-0.5">从模板开始，快速创建你的内容</p>
          </div>
          <button
            onClick={() => toggleTemplateModal(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-gray-100 flex gap-2 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#1e3a5f] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                onClick={() => handleSelectTemplate(template.id)}
                className="group relative bg-gray-50 border-2 border-gray-100 rounded-xl p-5 cursor-pointer transition-all duration-200 hover:border-[#f59e0b] hover:bg-white hover:shadow-lg hover:scale-[1.02]"
              >
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs bg-[#f59e0b] text-white px-2 py-1 rounded-full font-medium">
                    使用
                  </span>
                </div>
                
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#1e3a5f] mb-4 group-hover:bg-[#1e3a5f] group-hover:text-white transition-colors">
                  {iconMap[template.icon] || <FileText size={24} />}
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{template.description}</p>
                
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${categoryColors[template.category] || 'bg-gray-100 text-gray-700'}`}>
                  {template.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-between items-center">
          <p className="text-sm text-gray-500">
            共 {filteredTemplates.length} 个模板
          </p>
          <button
            onClick={() => {
              createNewArticle();
              toggleTemplateModal(false);
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
          >
            创建空白文章
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;
