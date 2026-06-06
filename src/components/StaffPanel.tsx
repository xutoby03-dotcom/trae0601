import { useGameStore } from '@/store/gameStore';

const StaffPanel = () => {
  const { staff, hireStaff, fireStaff, money, phase } = useGameStore();

  return (
    <div>
      <h3>👥 员工管理</h3>
      
      <div className="staff-list">
        {staff.map(s => (
          <div key={s.id} className={`staff-item ${s.hired ? 'hired' : ''}`}>
            <span className="emoji">{s.emoji}</span>
            <div className="info">
              <div className="name">{s.name}</div>
              <div className="desc">{s.description}</div>
              <div className="salary">日薪: ¥{s.salary} | 技能: Lv.{s.skill}</div>
            </div>
            {s.hired ? (
              <button 
                className="btn btn-danger btn-sm"
                onClick={() => phase === 'planning' && fireStaff(s.id)}
                disabled={phase !== 'planning'}
              >
                解雇
              </button>
            ) : (
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => hireStaff(s.id)}
                disabled={money < s.hireCost || phase !== 'planning'}
              >
                雇佣 ¥{s.hireCost}
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="hint" style={{ marginTop: '16px' }}>
        💡 雇佣员工可以加快服务速度，提升客人满意度
      </p>
    </div>
  );
};

export default StaffPanel;
