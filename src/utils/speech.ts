export function speak(text: string): void {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  }
}

export function speakQueueNumber(queueNumber: number, customerName: string): void {
  const text = `请 ${queueNumber} 号 ${customerName} 取货`;
  speak(text);
}

export function speakPriorityReminder(): void {
  speak('冷藏商品，请优先取货');
}
