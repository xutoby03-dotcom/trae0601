import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export function useKeyboardShortcuts() {
  const toggleComparisonActive = useStore((s) => s.toggleComparisonActive);
  const comparison = useStore((s) => s.comparison);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (comparison.a && comparison.b) {
          toggleComparisonActive();
        }
      }

      if (e.code === 'KeyA') {
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach((audio) => audio.pause());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [comparison.a, comparison.b, toggleComparisonActive]);
}
