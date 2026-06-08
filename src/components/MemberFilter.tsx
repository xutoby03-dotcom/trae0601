import { useMemberStore } from '@/store/memberStore'
import { useMedicineStore } from '@/store/medicineStore'
import { cn } from '@/lib/utils'

export default function MemberFilter() {
  const { members } = useMemberStore()
  const { selectedMemberTag, setSelectedMemberTag } = useMedicineStore()

  return (
    <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <button
        onClick={() => setSelectedMemberTag(null)}
        className={cn(
          'shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border',
          !selectedMemberTag
            ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200'
            : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-300 hover:text-emerald-600'
        )}
      >
        全部
      </button>
      {members.map(member => (
        <button
          key={member.id}
          onClick={() => setSelectedMemberTag(
            selectedMemberTag === member.tag ? null : member.tag
          )}
          className={cn(
            'shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border',
            selectedMemberTag === member.tag
              ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200'
              : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-300 hover:text-emerald-600'
          )}
        >
          <span className="text-base">{member.avatar}</span>
          {member.name}
        </button>
      ))}
    </div>
  )
}
