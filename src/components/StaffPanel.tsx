import { useGameStore } from '@/store/gameStore';
import { StaffType } from '@/types/game';

const StaffPanel = () => {
  const { staff, staffCandidates, hireStaff, fireStaff, money, phase } = useGameStore();

  const positionNames: Record<StaffType, { name: string; emoji: string }> = {
    cashier: { name: '收银员', emoji: '💁' },
    waiter: { name: '服务员', emoji: '🧑‍🍳' },
    chef: { name: '咖啡师', emoji: '👨‍🍳' },
  };

  const getSkillStars = (skill: number) => {
    return '⭐'.repeat(skill) + '☆'.repeat(3 - skill);
  };

  const getSkillColor = (skill: number) => {
    if (skill === 1) return '#a0aec0';
    if (skill === 2) return '#ed8936';
    return '#38a169';
  };

  const renderPosition = (type: StaffType) => {
    const hired = staff.find(s => s.type === type);
    const candidates = staffCandidates.filter(s => s.type === type);
    const positionInfo = positionNames[type];

    return (
      <div key={type} style={{ marginBottom: '20px' }}>
        <h4 style={{ color: '#4a5568', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {positionInfo.emoji} {positionInfo.name}
        </h4>
        
        {hired ? (
          <div className="staff-item hired" style={{ marginBottom: '8px' }}>
            <span className="emoji">{hired.emoji}</span>
            <div className="info">
              <div className="name">
                {hired.name} 
                <span style={{ marginLeft: '8px', color: getSkillColor(hired.skill) }}>
                  {getSkillStars(hired.skill)}
                </span>
              </div>
              <div className="desc">{hired.description}</div>
              <div className="salary">日薪: ¥{hired.salary}</div>
            </div>
            <button 
              className="btn btn-danger btn-sm"
              onClick={() => phase === 'planning' && fireStaff(hired.id)}
              disabled={phase !== 'planning'}
            >
              解雇
            </button>
          </div>
        ) : (
          <div style={{ fontSize: '13px', color: '#718096', marginBottom: '8px', fontStyle: 'italic' }}>
            暂未招聘，从下方选择候选人：
          </div>
        )}

        {!hired && candidates.length > 0 && (
          <div className="staff-list">
            {candidates.map(candidate => (
              <div key={candidate.id} className="staff-item">
                <span className="emoji">{candidate.emoji}</span>
                <div className="info">
                  <div className="name">
                    {candidate.name}
                    <span style={{ marginLeft: '8px', color: getSkillColor(candidate.skill), fontSize: '12px' }}>
                      {getSkillStars(candidate.skill)}
                    </span>
                  </div>
                  <div className="desc">{candidate.description}</div>
                  <div className="salary">日薪: ¥{candidate.salary}</div>
                </div>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => hireStaff(candidate.id)}
                  disabled={money < candidate.hireCost || phase !== 'planning'}
                >
                  雇 ¥{candidate.hireCost}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <h3>👥 员工招聘</h3>
      
      {renderPosition('cashier')}
      {renderPosition('waiter')}
      {renderPosition('chef')}

      <div style={{ background: '#f7fafc', padding: '12px', borderRadius: '10px', marginTop: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#4a5568', marginBottom: '6px' }}>
          📊 技能效果说明
        </div>
        <ul style={{ fontSize: '12px', color: '#718096', paddingLeft: '16px', margin: 0 }}>
          <li>收银员技能：加快点餐速度</li>
          <li>服务员技能：提升顾客满意度加成</li>
          <li>咖啡师技能：加快餐品制作速度</li>
          <li>等级越高，效果越强！</li>
        </ul>
      </div>
    </div>
  );
};

export default StaffPanel;
