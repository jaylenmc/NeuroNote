import { useEffect, useRef, useCallback } from 'react';

export default function useAutoResizeTextarea(value) {
  const ref = useRef(null);

  const resizeTextarea = useCallback(() => {
    const textarea = ref.current;
    if (textarea) {
      try {
        // Store the current scroll position
        const scrollTop = textarea.scrollTop;
        
        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = 'auto';
        textarea.style.overflow = 'hidden';
        
        // Calculate the new height based on content
        // Use scrollHeight directly, with a minimum height based on line-height
        const computedStyle = window.getComputedStyle(textarea);
        const lineHeight = parseFloat(computedStyle.lineHeight) || parseFloat(computedStyle.fontSize);
        const fontSize = parseFloat(computedStyle.fontSize);
        
        // Use a more reasonable minimum height (at least 1.5x line height)
        const minHeight = Math.max(lineHeight * 1.5, fontSize * 1.5);
        
        const newHeight = Math.max(textarea.scrollHeight, minHeight);
        
        // Ensure the height is not too small (minimum 40px)
        const finalHeight = Math.max(newHeight, 40);
        
        // Debug logging
        console.log('Auto-resize debug:', {
          scrollHeight: textarea.scrollHeight,
          clientHeight: textarea.clientHeight,
          lineHeight,
          fontSize,
          minHeight,
          newHeight,
          finalHeight,
          computedStyle: {
            lineHeight: computedStyle.lineHeight,
            fontSize: computedStyle.fontSize
          }
        });
        
        // Set the new height
        textarea.style.height = `${finalHeight}px`;
        
        // Restore scroll position
        textarea.scrollTop = scrollTop;
        
        // Force a reflow to ensure the height is applied
        textarea.offsetHeight;
      } catch (error) {
        console.error('Error resizing textarea:', error);
      }
    }
  }, []);

  useEffect(() => {
    const textarea = ref.current;
    if (textarea) {
      // Initial resize
      resizeTextarea();
      
      // Add input event listener for real-time resizing
      const handleInput = () => {
        resizeTextarea();
      };
      
      // Add change event listener as backup
      const handleChange = () => {
        setTimeout(resizeTextarea, 0);
      };
      
      textarea.addEventListener('input', handleInput);
      textarea.addEventListener('change', handleChange);
      
      // Also resize on focus to handle any missed updates
      const handleFocus = () => {
        setTimeout(resizeTextarea, 0);
      };
      
      textarea.addEventListener('focus', handleFocus);
      
      // Cleanup
      return () => {
        textarea.removeEventListener('input', handleInput);
        textarea.removeEventListener('change', handleChange);
        textarea.removeEventListener('focus', handleFocus);
      };
    }
  }, [value, resizeTextarea]);

  return ref;
} 