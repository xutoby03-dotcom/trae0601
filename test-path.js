const normalizeJsonPath = (path) => {
  if (!path || path === '$') return '$';
  let result = path;
  result = result.replace(/\['([^']+)'\]/g, '.$1');
  result = result.replace(/\["([^"]+)"\]/g, '.$1');
  result = result.replace(/\.\[/g, '[');
  result = result.replace(/^\$\./, '$.');
  if (result === '$') return '$';
  return result;
};

const getParentPaths = (path) => {
  const parents = [];
  if (!path || path === '$') return parents;

  const parts = [];
  let current = '';
  let i = 0;

  while (i < path.length) {
    if (path[i] === '.') {
      if (current) {
        parts.push(current);
        current = '';
      }
      i++;
    } else if (path[i] === '[') {
      if (current) {
        parts.push(current);
        current = '';
      }
      const endBracket = path.indexOf(']', i);
      if (endBracket === -1) break;
      parts.push(path.slice(i, endBracket + 1));
      i = endBracket + 1;
    } else {
      current += path[i];
      i++;
    }
  }
  if (current) parts.push(current);

  let accumulator = '$';
  for (let j = 1; j < parts.length; j++) {
    const part = parts[j];
    if (part.startsWith('[')) {
      accumulator += part;
    } else {
      accumulator += '.' + part;
    }
    parents.push(accumulator);
  }

  return parents.slice(0, -1);
};

console.log('=== 路径归一化测试 ===');
console.log("$['users'][0]['name'] ->", normalizeJsonPath("$['users'][0]['name']"));
console.log("期望: $.users[0].name");
console.log();
console.log("$['users'] ->", normalizeJsonPath("$['users']"));
console.log("期望: $.users");
console.log();
console.log("$['metadata']['total'] ->", normalizeJsonPath("$['metadata']['total']"));
console.log("期望: $.metadata.total");
console.log();

console.log('=== 父路径测试 ===');
console.log("$.users[0].name 的父路径:", getParentPaths('$.users[0].name'));
console.log("期望: ['$', '$.users', '$.users[0]']");
console.log();
console.log("$.metadata.total 的父路径:", getParentPaths('$.metadata.total'));
console.log("期望: ['$', '$.metadata']");
