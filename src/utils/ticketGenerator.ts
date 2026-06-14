const dailyCounterMap = new Map<string, number>();

export function generateTicketNumber(existingNumbers: string[] = []): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const datePrefix = `${y}${m}${d}`;

  let counter = dailyCounterMap.get(datePrefix) ?? 0;
  if (counter === 0 && existingNumbers.length > 0) {
    const todayPrefix = `T${datePrefix}`;
    existingNumbers.forEach((num) => {
      if (num.startsWith(todayPrefix)) {
        const seq = parseInt(num.slice(todayPrefix.length), 10);
        if (!isNaN(seq) && seq > counter) counter = seq;
      }
    });
  }

  counter += 1;
  dailyCounterMap.set(datePrefix, counter);
  const seqStr = String(counter).padStart(4, '0');
  return `T${datePrefix}${seqStr}`;
}

export function generateId(prefix: string = ''): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const ts = Date.now().toString(36);
  return `${prefix}${ts}${rand}`;
}
