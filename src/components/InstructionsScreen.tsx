import { useGameStore } from '../store/gameStore';

export const InstructionsScreen = () => {
  const { setScreen } = useGameStore();

  const returnToTitle = () => {
    useGameStore.setState({
      screen: 'title',
      currentNodeId: 'title',
      battle: null,
      message: null,
    });
  };

  return (
    <div className="instructions-screen">
      <div className="instructions-container">
        <h1 className="instructions-title">📖 游戏说明</h1>

        <div className="instructions-content">
          <div className="instruction-section">
            <h3>🗺️ 场景探索</h3>
            <ul>
              <li>每个场景会显示一段剧情描述</li>
              <li>点击底部的选项按钮进行选择</li>
              <li>不同的选择会通向不同的剧情分支</li>
              <li>有些选项需要特定道具或条件才能解锁</li>
            </ul>
          </div>

          <div className="instruction-section">
            <h3>🎒 背包系统</h3>
            <ul>
              <li>点击左侧「背包」按钮打开背包</li>
              <li>武器和护甲可以装备，提升攻击/防御属性</li>
              <li>消耗品（药水、炸弹等）可以在战斗中使用</li>
              <li>重要道具会在剧情中自动使用</li>
            </ul>
          </div>

          <div className="instruction-section">
            <h3>⚔️ 回合制战斗</h3>
            <ul>
              <li>你和怪物轮流行动，速度快的先出手</li>
              <li><strong>攻击</strong>：普通攻击，造成物理伤害</li>
              <li><strong>技能</strong>：消耗魔力，造成魔法伤害或回血</li>
              <li><strong>道具</strong>：使用背包里的消耗品</li>
              <li><strong>逃跑</strong>：有概率逃离战斗（Boss战无法逃跑）</li>
            </ul>
          </div>

          <div className="instruction-section">
            <h3>💾 存档读档</h3>
            <ul>
              <li>点击左侧「存档」按钮保存进度</li>
              <li>最多可以保存 5 个存档</li>
              <li>关键节点会自动存档（槽位 0）</li>
              <li>死亡后可以从最近存档继续</li>
            </ul>
          </div>

          <div className="instruction-section">
            <h3>🏆 结局收集</h3>
            <ul>
              <li>游戏共有 4 种结局：好结局、普通结局、坏结局、隐藏结局</li>
              <li>多探索不同的分支路线</li>
              <li>隐藏结局需要完成支线任务才能解锁</li>
              <li>祝你好运，勇者！</li>
            </ul>
          </div>
        </div>

        <button className="instructions-back-btn" onClick={returnToTitle}>
          🏠 返回标题
        </button>
      </div>
    </div>
  );
};
