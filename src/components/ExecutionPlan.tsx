import { useState } from 'react';
import { ChevronRight, ChevronDown, Database, Table, Filter, SortAsc, ArrowRightLeft } from 'lucide-react';
import { useEditorStore } from '@/stores/useEditorStore';
import { cn } from '@/lib/utils';

interface PlanNode {
  id: string;
  label: string;
  details: string;
  children: PlanNode[];
  icon?: 'table' | 'filter' | 'sort' | 'join' | 'scan';
}

function parseExecutionPlan(sql: string): PlanNode | null {
  if (!sql.trim()) return null;

  const sqlUpper = sql.toUpperCase();
  const nodes: PlanNode[] = [];

  if (sqlUpper.includes('SELECT')) {
    nodes.push({
      id: 'project',
      label: 'Projection',
      details: '选择列',
      icon: 'scan',
      children: [],
    });
  }

  if (sqlUpper.includes('WHERE')) {
    const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+GROUP|\s+ORDER|\s+LIMIT|$)/is);
    nodes.push({
      id: 'filter',
      label: 'Filter',
      details: whereMatch ? `条件: ${whereMatch[1].trim().slice(0, 50)}...` : '过滤条件',
      icon: 'filter',
      children: [],
    });
  }

  if (sqlUpper.includes('JOIN')) {
    const joinCount = (sqlUpper.match(/JOIN/g) || []).length;
    nodes.push({
      id: 'join',
      label: 'Join',
      details: `${joinCount} 个连接操作`,
      icon: 'join',
      children: [],
    });
  }

  if (sqlUpper.includes('GROUP BY')) {
    nodes.push({
      id: 'group',
      label: 'Group By',
      details: '分组聚合',
      icon: 'table',
      children: [],
    });
  }

  if (sqlUpper.includes('ORDER BY')) {
    nodes.push({
      id: 'sort',
      label: 'Sort',
      details: '排序操作',
      icon: 'sort',
      children: [],
    });
  }

  const tableMatches = sql.match(/FROM\s+([\w,]+)(?:\s|$)/i);
  if (tableMatches) {
    const tables = tableMatches[1].split(',').map((t) => t.trim());
    tables.forEach((table, i) => {
      nodes.push({
        id: `table-${i}`,
        label: 'Table Scan',
        details: `表: ${table}`,
        icon: 'table',
        children: [],
      });
    });
  }

  if (nodes.length === 0) return null;

  let root: PlanNode = nodes[0];
  let current = root;
  for (let i = 1; i < nodes.length; i++) {
    current.children = [nodes[i]];
    current = nodes[i];
  }

  return root;
}

function PlanNodeView({ node, depth = 0 }: { node: PlanNode; depth?: number }) {
  const [expanded, setExpanded] = useState(true);

  const getIcon = (icon?: string) => {
    switch (icon) {
      case 'table':
        return <Table className="w-4 h-4 text-purple-500" />;
      case 'filter':
        return <Filter className="w-4 h-4 text-blue-500" />;
      case 'sort':
        return <SortAsc className="w-4 h-4 text-green-500" />;
      case 'join':
        return <ArrowRightLeft className="w-4 h-4 text-orange-500" />;
      default:
        return <Database className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div style={{ marginLeft: depth * 16 }}>
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-sm',
          depth === 0 && 'font-medium'
        )}
        onClick={() => setExpanded(!expanded)}
      >
        {node.children.length > 0 ? (
          expanded ? (
            <ChevronDown className="w-3 h-3 text-gray-500" />
          ) : (
            <ChevronRight className="w-3 h-3 text-gray-500" />
          )
        ) : (
          <span className="w-3" />
        )}
        {getIcon(node.icon)}
        <span className="text-gray-700 dark:text-gray-300">{node.label}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{node.details}</span>
      </div>
      {expanded && node.children.length > 0 && (
        <div>
          {node.children.map((child) => (
            <PlanNodeView key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ExecutionPlan() {
  const { sql, showExecutionPlan } = useEditorStore();
  const plan = parseExecutionPlan(sql);

  if (!showExecutionPlan) return null;

  return (
    <div className="h-64 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col">
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
        <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Database className="w-4 h-4" />
          执行计划
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          基于 SQL 语句的估计执行计划
        </span>
      </div>
      <div className="flex-1 overflow-auto p-2">
        {plan ? (
          <PlanNodeView node={plan} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
            输入 SQL 语句以查看执行计划
          </div>
        )}
      </div>
    </div>
  );
}
