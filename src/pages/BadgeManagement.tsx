import { useState } from 'react';
import { BadgeTable } from '../components/badges/BadgeTable';
import { BadgeForm } from '../components/badges/BadgeForm';
import type { Badge } from '../types';

export const BadgeManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);

  const handleNew = () => {
    setEditingBadge(null);
    setShowForm(true);
  };

  const handleEdit = (badge: Badge) => {
    setEditingBadge(badge);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingBadge(null);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6">
      <BadgeTable onEdit={handleEdit} onNew={handleNew} />
      <BadgeForm open={showForm} onClose={handleClose} editingBadge={editingBadge} />
    </div>
  );
};
