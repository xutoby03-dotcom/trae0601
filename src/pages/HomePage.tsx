import { useNavigate } from 'react-router-dom';
import { Settings, GraduationCap, Trophy, Flag, ArrowRight, Users } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function HomePage() {
  const navigate = useNavigate();
  const { setUserRole, courses, students, trainingSessions } = useAppStore();

  const handleCoachMode = () => {
    setUserRole('coach');
    navigate('/designer');
  };

  const handleStudentMode = () => {
    setUserRole('student');
    navigate('/practice');
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col justify-center">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-equestrian-gold-100 rounded-full mb-6">
          <Flag className="w-10 h-10 text-equestrian-gold-600" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-equestrian-brown-800 mb-3">
          马术路线记忆板
        </h1>
        <p className="text-equestrian-brown-500 text-lg max-w-md mx-auto">
          帮助骑手在实际骑乘前熟悉障碍路线，提升记忆效率，降低训练风险
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8 max-w-3xl mx-auto">
        <button
          onClick={handleCoachMode}
          className="group relative bg-white rounded-2xl shadow-elegant-lg p-8 text-left hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-equestrian-gold-300"
        >
          <div className="w-16 h-16 bg-equestrian-brown-100 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-equestrian-gold-100 transition-colors">
            <Settings className="w-8 h-8 text-equestrian-brown-600 group-hover:text-equestrian-gold-700 transition-colors" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-equestrian-brown-800 mb-2">
            教练模式
          </h2>
          <p className="text-equestrian-brown-500 mb-5">
            设计障碍路线，管理学员训练，查看训练报告
          </p>
          <div className="flex items-center text-equestrian-gold-600 font-medium group-hover:gap-3 transition-all gap-2">
            <span>进入设计</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>

        <button
          onClick={handleStudentMode}
          className="group relative bg-white rounded-2xl shadow-elegant-lg p-8 text-left hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-equestrian-gold-300"
        >
          <div className="w-16 h-16 bg-equestrian-gold-100 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-equestrian-gold-200 transition-colors">
            <GraduationCap className="w-8 h-8 text-equestrian-gold-600 group-hover:text-equestrian-gold-700 transition-colors" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-equestrian-brown-800 mb-2">
            学员模式
          </h2>
          <p className="text-equestrian-brown-500 mb-5">
            记忆障碍路线，练习复述顺序，查看个人成绩
          </p>
          <div className="flex items-center text-equestrian-gold-600 font-medium group-hover:gap-3 transition-all gap-2">
            <span>开始练习</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mt-12">
        <div className="text-center p-4">
          <div className="text-3xl font-bold text-equestrian-brown-800 font-serif">{courses.length}</div>
          <div className="text-sm text-equestrian-brown-500 mt-1">训练路线</div>
        </div>
        <div className="text-center p-4">
          <div className="text-3xl font-bold text-equestrian-brown-800 font-serif">{students.length}</div>
          <div className="text-sm text-equestrian-brown-500 mt-1">学员数量</div>
        </div>
        <div className="text-center p-4">
          <div className="text-3xl font-bold text-equestrian-brown-800 font-serif">{trainingSessions.length}</div>
          <div className="text-sm text-equestrian-brown-500 mt-1">训练记录</div>
        </div>
      </div>

      <div className="text-center mt-12">
        <button
          onClick={() => navigate('/report')}
          className="inline-flex items-center gap-2 text-equestrian-brown-600 hover:text-equestrian-brown-800 transition-colors"
        >
          <Trophy className="w-4 h-4" />
          <span>查看训练报告</span>
        </button>
      </div>
    </div>
  );
}
