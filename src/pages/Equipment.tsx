import { useState } from 'react';
import {
  Monitor,
  Lightbulb,
  User as UserIcon,
  Users,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Ruler,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { SCREEN_MATERIALS, PUPPET_MATERIALS, STANDING_ZONES } from '@/types';

export default function Equipment() {
  const {
    screen,
    setScreen,
    lamps,
    addLamp,
    updateLamp,
    removeLamp,
    puppets,
    addPuppet,
    updatePuppet,
    removePuppet,
    actors,
    addActor,
    updateActor,
    removeActor,
  } = useAppStore();

  const [screenForm, setScreenForm] = useState({
    widthCm: screen?.widthCm || 300,
    heightCm: screen?.heightCm || 180,
    material: screen?.material || SCREEN_MATERIALS[0],
    heightFromGroundCm: screen?.heightFromGroundCm || 80,
    notes: screen?.notes || '',
  });
  const [editingLampId, setEditingLampId] = useState<string | null>(null);
  const [editingPuppetId, setEditingPuppetId] = useState<string | null>(null);
  const [editingActorId, setEditingActorId] = useState<string | null>(null);

  const handleSaveScreen = () => {
    setScreen(screenForm);
  };

  const handleAddLamp = () => {
    addLamp({
      model: 'LED聚光灯',
      positionDistanceCm: 150,
      positionAngleDeg: 0,
      positionHeightCm: 200,
      brightnessLevel: 7,
      colorTemp: '3200K暖光',
    });
  };

  const handleAddPuppet = () => {
    addPuppet({
      name: '新皮影',
      material: PUPPET_MATERIALS[0],
      thicknessMm: 2,
      rodLengthCm: 50,
    });
  };

  const handleAddActor = () => {
    addActor({
      name: '演员',
      role: '操纵',
      standingZone: STANDING_ZONES[0],
    });
  };

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="font-serif text-3xl font-bold text-ocher-700 mb-2">设备登记</h1>
        <p className="text-ocher-500">登记幕布、灯具、皮影与演员信息，为光学校准提供基础数据</p>
      </div>

      {/* 幕布设置 */}
      <section className="paper-card">
        <h2 className="section-title">
          <Monitor className="w-5 h-5 text-gold-400" strokeWidth={1.8} />
          幕布设置
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">宽度 (cm)</label>
              <input
                type="number"
                className="input-field"
                value={screenForm.widthCm}
                onChange={(e) =>
                  setScreenForm({ ...screenForm, widthCm: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="label-text">高度 (cm)</label>
              <input
                type="number"
                className="input-field"
                value={screenForm.heightCm}
                onChange={(e) =>
                  setScreenForm({ ...screenForm, heightCm: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="label-text">离地高度 (cm)</label>
              <input
                type="number"
                className="input-field"
                value={screenForm.heightFromGroundCm}
                onChange={(e) =>
                  setScreenForm({
                    ...screenForm,
                    heightFromGroundCm: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="label-text">幕布材质</label>
              <select
                className="input-field"
                value={screenForm.material}
                onChange={(e) => setScreenForm({ ...screenForm, material: e.target.value })}
              >
                {SCREEN_MATERIALS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label-text">备注</label>
              <input
                type="text"
                className="input-field"
                placeholder="其他需要说明的幕布信息..."
                value={screenForm.notes}
                onChange={(e) => setScreenForm({ ...screenForm, notes: e.target.value })}
              />
            </div>
          </div>

          {/* 幕布示意图 */}
          <div className="bg-ocher-50/50 rounded-lg p-6 flex flex-col items-center justify-center border border-ocher-200/50">
            <div
              className="relative bg-white border-2 border-ocher-400 shadow-inner"
              style={{
                width: `${Math.min(screenForm.widthCm / 8, 200)}px`,
                height: `${Math.min(screenForm.heightCm / 8, 120)}px`,
              }}
            >
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-xs text-ocher-600 flex items-center gap-1">
                <Ruler className="w-3 h-3 rotate-90" />
                {screenForm.heightCm}
              </div>
              <div className="absolute left-1/2 -bottom-6 -translate-x-1/2 text-xs text-ocher-600 flex items-center gap-1">
                <Ruler className="w-3 h-3" />
                {screenForm.widthCm}
              </div>
            </div>
            <p className="text-xs text-ocher-500 mt-8">
              离地 {screenForm.heightFromGroundCm}cm · {screenForm.material}
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <button className="btn-primary flex items-center gap-2" onClick={handleSaveScreen}>
            <Save className="w-4 h-4" />
            保存幕布设置
          </button>
        </div>
      </section>

      {/* 灯具配置 */}
      <section className="paper-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title !mb-0">
            <Lightbulb className="w-5 h-5 text-gold-400" strokeWidth={1.8} />
            灯具配置
          </h2>
          <button className="btn-secondary flex items-center gap-2" onClick={handleAddLamp}>
            <Plus className="w-4 h-4" />
            添加灯具
          </button>
        </div>

        <div className="space-y-3">
          {lamps.length === 0 && (
            <p className="text-center py-8 text-ocher-400 text-sm">暂无灯具，请点击右上角添加</p>
          )}
          {lamps.map((lamp) => (
            <div
              key={lamp.id}
              className="border border-ocher-200/60 rounded-lg p-4 bg-white/40 hover:bg-white/60 transition-colors"
            >
              {editingLampId === lamp.id ? (
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  <div className="col-span-2 md:col-span-1">
                    <label className="label-text">型号</label>
                    <input
                      className="input-field text-sm"
                      value={lamp.model}
                      onChange={(e) => updateLamp(lamp.id, { model: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label-text">距幕布(cm)</label>
                    <input
                      type="number"
                      className="input-field text-sm"
                      value={lamp.positionDistanceCm}
                      onChange={(e) =>
                        updateLamp(lamp.id, { positionDistanceCm: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <label className="label-text">水平角度(°)</label>
                    <input
                      type="number"
                      className="input-field text-sm"
                      value={lamp.positionAngleDeg}
                      onChange={(e) =>
                        updateLamp(lamp.id, { positionAngleDeg: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <label className="label-text">高度(cm)</label>
                    <input
                      type="number"
                      className="input-field text-sm"
                      value={lamp.positionHeightCm}
                      onChange={(e) =>
                        updateLamp(lamp.id, { positionHeightCm: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <label className="label-text">亮度(1-10)</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      className="input-field text-sm"
                      value={lamp.brightnessLevel}
                      onChange={(e) =>
                        updateLamp(lamp.id, { brightnessLevel: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <label className="label-text">色温</label>
                    <input
                      className="input-field text-sm"
                      value={lamp.colorTemp}
                      onChange={(e) => updateLamp(lamp.id, { colorTemp: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 md:col-span-6 flex justify-end gap-2 pt-1">
                    <button
                      className="btn-secondary !px-3 !py-1.5 text-sm"
                      onClick={() => setEditingLampId(null)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-gold-400" />
                      <span className="font-medium text-ocher-700">{lamp.model}</span>
                    </div>
                    <span className="tag-badge bg-ocher-100 text-ocher-700">
                      距幕 {lamp.positionDistanceCm}cm
                    </span>
                    <span className="tag-badge bg-ocher-100 text-ocher-700">
                      角度 {lamp.positionAngleDeg}°
                    </span>
                    <span className="tag-badge bg-ocher-100 text-ocher-700">
                      高 {lamp.positionHeightCm}cm
                    </span>
                    <span className="tag-badge bg-gold-100 text-gold-500">
                      亮度 {lamp.brightnessLevel}/10
                    </span>
                    <span className="tag-badge bg-blue-100 text-blue-600">{lamp.colorTemp}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="p-2 text-ocher-500 hover:text-ocher-700 hover:bg-ocher-100 rounded-lg transition-colors"
                      onClick={() => setEditingLampId(lamp.id)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-crimson/70 hover:text-crimson hover:bg-red-50 rounded-lg transition-colors"
                      onClick={() => removeLamp(lamp.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 皮影材质 */}
      <section className="paper-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title !mb-0">
            <UserIcon className="w-5 h-5 text-gold-400" strokeWidth={1.8} />
            皮影材质
          </h2>
          <button className="btn-secondary flex items-center gap-2" onClick={handleAddPuppet}>
            <Plus className="w-4 h-4" />
            添加皮影
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {puppets.length === 0 && (
            <p className="col-span-full text-center py-8 text-ocher-400 text-sm">
              暂无皮影，请点击右上角添加
            </p>
          )}
          {puppets.map((puppet) => (
            <div
              key={puppet.id}
              className="border border-ocher-200/60 rounded-lg p-4 bg-white/40 hover:bg-white/60 transition-colors"
            >
              {editingPuppetId === puppet.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="label-text">名称</label>
                    <input
                      className="input-field text-sm"
                      value={puppet.name}
                      onChange={(e) => updatePuppet(puppet.id, { name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="label-text">材质</label>
                      <select
                        className="input-field text-sm"
                        value={puppet.material}
                        onChange={(e) => updatePuppet(puppet.id, { material: e.target.value })}
                      >
                        {PUPPET_MATERIALS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label-text">厚度(mm)</label>
                      <input
                        type="number"
                        step={0.5}
                        className="input-field text-sm"
                        value={puppet.thicknessMm}
                        onChange={(e) =>
                          updatePuppet(puppet.id, { thicknessMm: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div>
                      <label className="label-text">操纵杆(cm)</label>
                      <input
                        type="number"
                        className="input-field text-sm"
                        value={puppet.rodLengthCm}
                        onChange={(e) =>
                          updatePuppet(puppet.id, { rodLengthCm: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      className="btn-secondary !px-3 !py-1.5 text-sm"
                      onClick={() => setEditingPuppetId(null)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-ocher-700">{puppet.name}</h3>
                    <div className="flex gap-1">
                      <button
                        className="p-1.5 text-ocher-500 hover:text-ocher-700 hover:bg-ocher-100 rounded transition-colors"
                        onClick={() => setEditingPuppetId(puppet.id)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="p-1.5 text-crimson/70 hover:text-crimson hover:bg-red-50 rounded transition-colors"
                        onClick={() => removePuppet(puppet.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="tag-badge bg-ocher-100 text-ocher-700">
                      {puppet.material}
                    </span>
                    <span className="tag-badge bg-gold-100 text-gold-500">
                      厚度 {puppet.thicknessMm}mm
                    </span>
                    <span className="tag-badge bg-blue-100 text-blue-600">
                      杆 {puppet.rodLengthCm}cm
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 演员站位 */}
      <section className="paper-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title !mb-0">
            <Users className="w-5 h-5 text-gold-400" strokeWidth={1.8} />
            演员站位
          </h2>
          <button className="btn-secondary flex items-center gap-2" onClick={handleAddActor}>
            <Plus className="w-4 h-4" />
            添加演员
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actors.length === 0 && (
            <p className="col-span-full text-center py-8 text-ocher-400 text-sm">
              暂无演员，请点击右上角添加
            </p>
          )}
          {actors.map((actor) => (
            <div
              key={actor.id}
              className="border border-ocher-200/60 rounded-lg p-4 bg-white/40 hover:bg-white/60 transition-colors"
            >
              {editingActorId === actor.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="label-text">姓名</label>
                    <input
                      className="input-field text-sm"
                      value={actor.name}
                      onChange={(e) => updateActor(actor.id, { name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label-text">角色</label>
                      <input
                        className="input-field text-sm"
                        value={actor.role}
                        onChange={(e) => updateActor(actor.id, { role: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label-text">站位区域</label>
                      <select
                        className="input-field text-sm"
                        value={actor.standingZone}
                        onChange={(e) =>
                          updateActor(actor.id, { standingZone: e.target.value })
                        }
                      >
                        {STANDING_ZONES.map((z) => (
                          <option key={z} value={z}>
                            {z}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      className="btn-secondary !px-3 !py-1.5 text-sm"
                      onClick={() => setEditingActorId(null)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-ocher-700">{actor.name}</h3>
                      <p className="text-sm text-ocher-500 mt-0.5">{actor.role}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="p-1.5 text-ocher-500 hover:text-ocher-700 hover:bg-ocher-100 rounded transition-colors"
                        onClick={() => setEditingActorId(actor.id)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="p-1.5 text-crimson/70 hover:text-crimson hover:bg-red-50 rounded transition-colors"
                        onClick={() => removeActor(actor.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="tag-badge bg-ocher-100 text-ocher-700">
                      {actor.standingZone}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
