import { useEffect, useRef } from 'react';

export default function useAutoResizeTextarea(value) {
  const ref = useRef(null);

  useEffect(() => {
    const textarea = ref.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [value]);

  return ref;
} 