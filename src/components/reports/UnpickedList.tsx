import { motion } from 'framer-motion';
import { UserX, MapPin, Phone, Ticket, Download } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Tag } from '../ui/Tag';
import { Button } from '../ui/Button';
import type { Member } from '../../types';

interface UnpickedListProps {
  members: Member[];
}

export function UnpickedList({ members }: UnpickedListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <UserX className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">未领取名单</h3>
                <p className="text-sm text-gray-500">共 {members.length} 人未领取</p>
              </div>
            </div>
            <Button variant="secondary" size="sm">
              <Download className="w-4 h-4 mr-1.5" />
              导出
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {members.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <UserX className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>所有成员都已领取</p>
              </div>
            ) : (
              members.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.03 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <Avatar name={member.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{member.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {member.seatSection}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Phone className="w-3 h-3" />
                        尾号 {member.phoneLastFour}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gradient">¥{member.amountDue}</p>
                    {member.canProxy && (
                      <Tag variant="gold" className="text-xs mt-1">可代领</Tag>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
