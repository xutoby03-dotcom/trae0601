import { getLevelColorClass } from '@/utils';

interface LevelTagProps {
  level: string;
}

export default function LevelTag({ level }: LevelTagProps) {
  return (
    <span className={`level-tag ${getLevelColorClass(level)}`}>
      {level}
    </span>
  );
}
