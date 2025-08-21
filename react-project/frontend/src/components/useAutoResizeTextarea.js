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
        // Get computed styles for accurate calculations
        const computedStyle = window.getComputedStyle(textarea);
        const lineHeight = parseFloat(computedStyle.lineHeight) || parseFloat(computedStyle.fontSize);
        const fontSize = parseFloat(computedStyle.fontSize);
        
        // Get padding values to subtract from scrollHeight
        const paddingTop = parseFloat(computedStyle.paddingTop);
        const paddingBottom = parseFloat(computedStyle.paddingBottom);
        const borderTop = parseFloat(computedStyle.borderTopWidth);
        const borderBottom = parseFloat(computedStyle.borderBottomWidth);
        
        // Check if content actually needs more than one line by comparing scrollHeight to lineHeight
        // For single lines, scrollHeight should be close to lineHeight
        const needsMultipleLines = textarea.scrollHeight > (lineHeight + 4); // Allow 4px tolerance for browser spacing
        const finalHeight = needsMultipleLines ? textarea.scrollHeight : lineHeight;
        // Debug logging
        console.log('Auto-resize debug:', {
          scrollHeight: textarea.scrollHeight,
          clientHeight: textarea.clientHeight,
          lineHeight,
          fontSize,
          needsMultipleLines,
          finalHeight,
          tolerance: lineHeight + 4,
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