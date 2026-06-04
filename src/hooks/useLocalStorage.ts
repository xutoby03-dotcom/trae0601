import { useEffect, useRef } from 'react';
import { useFormStore } from '../store/useFormStore';

export function useLocalStorageAutoSave() {
  const formData = useFormStore((state) => state.formData);
  const saveToStorage = useFormStore((state) => state.saveToStorage);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      saveToStorage();
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formData, saveToStorage]);
}

export function loadPublishedForm(id: string) {
  try {
    const data = localStorage.getItem(`published_form_${id}`);
    if (data) {
      return JSON.parse(data);
    }
  } catch {
    console.error('Failed to load published form');
  }
  return null;
}
