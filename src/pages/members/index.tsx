import { useState } from 'react'
import { useParams } from 'react-router-dom'
import MemberList from './MemberList'
import MemberForm from './MemberForm'
import MemberDetail from './MemberDetail'
import { useMemberStore } from '@/store/useMemberStore'
import type { Member } from '@/types'

export default function MembersPage() {
  const { id } = useParams<{ id: string }>()
  const { getMemberById } = useMemberStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)

  const handleAdd = () => {
    setEditingMember(null)
    setFormOpen(true)
  }

  const handleEdit = (member: Member) => {
    setEditingMember(member)
    setFormOpen(true)
  }

  const handleDetailEdit = () => {
    if (id) {
      const member = getMemberById(id)
      if (member) {
        setEditingMember(member)
        setFormOpen(true)
      }
    }
  }

  const handleFormSubmit = () => {
    setFormOpen(false)
    setEditingMember(null)
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingMember(null)
  }

  if (id) {
    return (
      <>
        <MemberDetail onEdit={handleDetailEdit} />
        <MemberForm
          isOpen={formOpen}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          initialData={editingMember || undefined}
        />
      </>
    )
  }

  return (
    <>
      <MemberList onAdd={handleAdd} onEdit={handleEdit} />
      <MemberForm
        isOpen={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={editingMember || undefined}
      />
    </>
  )
}
