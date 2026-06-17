function success(data, message = 'success') {
  return {
    code: 0,
    data,
    message,
  };
}

function error(message, code = -1, data = null) {
  return {
    code,
    data,
    message,
  };
}

function pagination(list, total, page, pageSize) {
  return {
    list,
    total,
    page: parseInt(page),
    page_size: parseInt(pageSize),
    total_pages: Math.ceil(total / pageSize),
  };
}

function mapRowToNested(row, prefixes) {
  const result = { ...row };
  
  for (const prefix of prefixes) {
    const nested = {};
    const prefixWithUnderscore = `${prefix}_`;
    let hasNested = false;
    
    for (const key in result) {
      if (key.startsWith(prefixWithUnderscore)) {
        let nestedKey = key.slice(prefixWithUnderscore.length);
        if (nestedKey.endsWith('_')) {
          nestedKey = nestedKey.slice(0, -1);
        }
        nested[nestedKey] = result[key];
        delete result[key];
        hasNested = true;
      }
    }
    
    if (hasNested) {
      result[prefix] = nested;
    }
  }
  
  return result;
}

module.exports = {
  success,
  error,
  pagination,
  mapRowToNested,
};
