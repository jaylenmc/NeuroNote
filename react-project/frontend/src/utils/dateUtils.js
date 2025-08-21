/**
 * Date utility functions to handle timezone issues between backend and frontend
 */

/**
 * Converts a datetime string from the backend (UTC) to a local date string
 * The backend now stores dates as DateTimeField in UTC, so we need to convert to local timezone
 * @param {string} dateString - Datetime string from backend (e.g., "2024-01-15T10:30:00Z")
 * @returns {string} - Local date string in YYYY-MM-DD format
 */
export const convertBackendDateToLocal = (dateString) => {
  if (!dateString) return null;
  
  // Create a date object from the backend datetime string
  const utcDate = new Date(dateString);
  
  // Check if the date is valid
  if (isNaN(utcDate.getTime())) {
    console.warn('Invalid date string:', dateString);
    return null;
  }
  
  // Convert to local date string in YYYY-MM-DD format
  // Use UTC methods to get the date as it was intended in UTC
  const year = utcDate.getUTCFullYear();
  const month = String(utcDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(utcDate.getUTCDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Converts a local date to a backend-compatible UTC datetime string
 * @param {Date|string} localDate - Local date object or string
 * @returns {string} - Datetime string in ISO format for backend (UTC)
 */
export const convertLocalDateToBackend = (localDate) => {
  if (!localDate) return null;
  
  // If it's a date-only string (YYYY-MM-DD), add current time
  if (typeof localDate === 'string' && localDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    localDate = `${localDate}T${currentTime}`;
  }
  
  const date = new Date(localDate);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.warn('Invalid local date:', localDate);
    return null;
  }
  
  // Convert local date to UTC datetime string with current time
  return date.toISOString();
};

/**
 * Formats a datetime for display using toLocaleDateString with proper timezone handling
 * @param {string} dateString - Datetime string from backend (UTC)
 * @param {Object} options - Options for toLocaleDateString
 * @returns {string} - Formatted date string
 */
export const formatDateForDisplay = (dateString, options = {}) => {
  if (!dateString) return '';
  
  // Convert UTC datetime to local date for display
  const localDateString = convertBackendDateToLocal(dateString);
  if (!localDateString) {
    console.warn('Invalid date string for display:', dateString);
    return '';
  }
  
  const date = new Date(localDateString + 'T00:00:00');
  
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  });
};

/**
 * Formats a datetime for display with time included (always shows time)
 * @param {string} dateString - Datetime string from backend (UTC)
 * @param {Object} options - Options for toLocaleDateString
 * @returns {string} - Formatted date and time string
 */
export const formatDateTimeForDisplay = (dateString, options = {}) => {
  if (!dateString) return '';
  try {
    // Create a date object from the backend datetime string (UTC)
    const utcDate = new Date(dateString);
    if (isNaN(utcDate.getTime())) {
      console.warn('Invalid date string for display:', dateString);
      return '';
    }
    // Default: hide seconds and timezone
    return utcDate.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      // Remove seconds and timezone
      ...options
    });
  } catch (error) {
    console.warn('Error formatting date with time:', error);
    return formatDateForDisplay(dateString, options);
  }
};

/**
 * Gets today's date in backend format (YYYY-MM-DD) in UTC
 * @returns {string} - Today's date in YYYY-MM-DD format (UTC)
 */
export const getTodayBackendFormat = () => {
  const today = new Date();
  return convertLocalDateToBackend(today);
};

/**
 * Compares two dates (from backend) for sorting or filtering
 * @param {string} dateA - First datetime string from backend (UTC)
 * @param {string} dateB - Second datetime string from backend (UTC)
 * @returns {number} - -1 if dateA < dateB, 0 if equal, 1 if dateA > dateB
 */
export const compareBackendDates = (dateA, dateB) => {
  const localA = convertBackendDateToLocal(dateA);
  const localB = convertBackendDateToLocal(dateB);
  
  if (!localA || !localB) return 0;
  
  return new Date(localA) - new Date(localB);
};

/**
 * Checks if a backend date is today
 * @param {string} dateString - Datetime string from backend (UTC)
 * @returns {boolean} - True if the date is today
 */
export const isBackendDateToday = (dateString) => {
  if (!dateString) return false;
  
  const localDateString = convertBackendDateToLocal(dateString);
  const today = getTodayBackendFormat();
  const todayLocal = convertBackendDateToLocal(today);
  
  return localDateString === todayLocal;
};

/**
 * Checks if a backend date is in the past
 * @param {string} dateString - Datetime string from backend (UTC)
 * @returns {boolean} - True if the date is in the past
 */
export const isBackendDatePast = (dateString) => {
  if (!dateString) return false;
  
  const localDateString = convertBackendDateToLocal(dateString);
  const today = getTodayBackendFormat();
  const todayLocal = convertBackendDateToLocal(today);
  
  if (!localDateString || !todayLocal) return false;
  
  return localDateString < todayLocal;
};

/**
 * Checks if a backend date is in the future
 * @param {string} dateString - Datetime string from backend (UTC)
 * @returns {boolean} - True if the date is in the future
 */
export const isBackendDateFuture = (dateString) => {
  if (!dateString) return false;
  
  const localDateString = convertBackendDateToLocal(dateString);
  const today = getTodayBackendFormat();
  const todayLocal = convertBackendDateToLocal(today);
  
  if (!localDateString || !todayLocal) return false;
  
  return localDateString > todayLocal;
};

/**
 * Checks if a backend datetime is due today (same date AND time is now or in the past)
 * @param {string} dateString - Datetime string from backend (UTC)
 * @returns {boolean} - True if the datetime is due today (same date and time <= now)
 */
export const isBackendDateTimeDueToday = (dateString) => {
  if (!dateString) return false;
  
  try {
    const cardDateTime = new Date(dateString);
    const now = new Date();
    
    // Check if the date is valid
    if (isNaN(cardDateTime.getTime())) {
      console.warn('Invalid date string for due today check:', dateString);
      return false;
    }
    
    // Get today's date at midnight for date comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const cardDate = new Date(cardDateTime);
    cardDate.setHours(0, 0, 0, 0);
    
    // Same date AND the scheduled time is now or in the past
    return cardDate.getTime() === today.getTime() && cardDateTime <= now;
  } catch (error) {
    console.warn('Error checking if datetime is due today:', error);
    return false;
  }
};

/**
 * Checks if a backend datetime is overdue (date is in the past OR same date but time is in the past)
 * @param {string} dateString - Datetime string from backend (UTC)
 * @returns {boolean} - True if the datetime is overdue
 */
export const isBackendDateTimeOverdue = (dateString) => {
  if (!dateString) return false;
  
  try {
    const cardDateTime = new Date(dateString);
    const now = new Date();
    
    // Check if the date is valid
    if (isNaN(cardDateTime.getTime())) {
      console.warn('Invalid date string for overdue check:', dateString);
      return false;
    }
    
    // Overdue if the scheduled datetime is in the past
    return cardDateTime < now;
  } catch (error) {
    console.warn('Error checking if datetime is overdue:', error);
    return false;
  }
};

/**
 * Checks if a backend datetime is upcoming (date is in the future OR same date but time is in the future)
 * @param {string} dateString - Datetime string from backend (UTC)
 * @returns {boolean} - True if the datetime is upcoming
 */
export const isBackendDateTimeUpcoming = (dateString) => {
  if (!dateString) return false;
  
  try {
    const cardDateTime = new Date(dateString);
    const now = new Date();
    
    // Check if the date is valid
    if (isNaN(cardDateTime.getTime())) {
      console.warn('Invalid date string for upcoming check:', dateString);
      return false;
    }
    
    // Upcoming if the scheduled datetime is in the future
    return cardDateTime > now;
  } catch (error) {
    console.warn('Error checking if datetime is upcoming:', error);
    return false;
  }
};

/**
 * Checks if a backend datetime is due now (same date AND time is now or in the past)
 * @param {string} dateString - Datetime string from backend (UTC)
 * @returns {boolean} - True if the datetime is due now (current time >= scheduled time)
 */
export const isBackendDateTimeDueNow = (dateString) => {
  if (!dateString) return false;
  
  try {
    const cardDateTime = new Date(dateString);
    const now = new Date();
    
    // Check if the date is valid
    if (isNaN(cardDateTime.getTime())) {
      console.warn('Invalid date string for due now check:', dateString);
      return false;
    }
    
    // Get today's date at midnight for date comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const cardDate = new Date(cardDateTime);
    cardDate.setHours(0, 0, 0, 0);
    
    // Same date AND the scheduled time is now or in the past (not before)
    return cardDate.getTime() === today.getTime() && 
           cardDateTime <= now;
  } catch (error) {
    console.warn('Error checking if datetime is due now:', error);
    return false;
  }
};

/**
 * Checks if a backend datetime is later today (same date AND time is more than an hour from now)
 * @param {string} dateString - Datetime string from backend (UTC)
 * @returns {boolean} - True if the datetime is later today (more than 1 hour from now)
 */
export const isBackendDateTimeLaterToday = (dateString) => {
  if (!dateString) return false;
  
  try {
    const cardDateTime = new Date(dateString);
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    
    // Check if the date is valid
    if (isNaN(cardDateTime.getTime())) {
      console.warn('Invalid date string for later today check:', dateString);
      return false;
    }
    
    // Get today's date at midnight for date comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const cardDate = new Date(cardDateTime);
    cardDate.setHours(0, 0, 0, 0);
    
    // Same date AND the scheduled time is more than an hour from now
    return cardDate.getTime() === today.getTime() && 
           cardDateTime > oneHourFromNow;
  } catch (error) {
    console.warn('Error checking if datetime is later today:', error);
    return false;
  }
};

/**
 * Gets the time difference in a human-readable format
 * @param {string} dateString - Datetime string from backend (UTC)
 * @returns {string} - Human-readable time difference (e.g., "in 12 minutes", "in 2 hours")
 */
export const getTimeDifference = (dateString) => {
  if (!dateString) return '';
  
  try {
    const cardDateTime = new Date(dateString);
    const now = new Date();
    
    // Check if the date is valid
    if (isNaN(cardDateTime.getTime())) {
      console.warn('Invalid date string for time difference:', dateString);
      return '';
    }
    
    const diffMs = cardDateTime.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      return 'now';
    }
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
      return `in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else {
      return 'now';
    }
  } catch (error) {
    console.warn('Error calculating time difference:', error);
    return '';
  }
};

/**
 * Gets the time difference for overdue cards (how long ago they were due)
 * @param {string} dateString - Datetime string from backend (UTC)
 * @returns {string} - Human-readable time difference (e.g., "3 hours ago", "12 minutes ago")
 */
export const getOverdueTimeDifference = (dateString) => {
  if (!dateString) return '';
  
  try {
    const cardDateTime = new Date(dateString);
    const now = new Date();
    
    // Check if the date is valid
    if (isNaN(cardDateTime.getTime())) {
      console.warn('Invalid date string for overdue time difference:', dateString);
      return '';
    }
    
    const diffMs = now.getTime() - cardDateTime.getTime();
    
    if (diffMs <= 0) {
      return 'just now';
    }
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'just now';
    }
  } catch (error) {
    console.warn('Error calculating overdue time difference:', error);
    return '';
  }
};

/**
 * Checks if a backend datetime is due soon (within the next hour)
 * @param {string} dateString - Datetime string from backend (UTC)
 * @returns {boolean} - True if the datetime is due within the next hour
 */
export const isBackendDateTimeDueSoon = (dateString) => {
  if (!dateString) return false;
  
  try {
    const cardDateTime = new Date(dateString);
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    
    // Check if the date is valid
    if (isNaN(cardDateTime.getTime())) {
      console.warn('Invalid date string for due soon check:', dateString);
      return false;
    }
    
    // Get today's date at midnight for date comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const cardDate = new Date(cardDateTime);
    cardDate.setHours(0, 0, 0, 0);
    
    // Same date AND the scheduled time is more than an hour from now but within the next hour
    return cardDate.getTime() === today.getTime() && 
           cardDateTime > now && 
           cardDateTime <= oneHourFromNow;
  } catch (error) {
    console.warn('Error checking if datetime is due soon:', error);
    return false;
  }
};

/**
 * Formats time display for cards based on their category
 * @param {string} dateString - Datetime string from backend (UTC)
 * @param {string} category - Card category ('overdue', 'dueNow', 'dueSoon', 'upcoming')
 * @returns {string} - Formatted time string for display
 */
export const formatTimeForCardDisplay = (dateString, category) => {
  if (!dateString) return 'Not scheduled';
  
  try {
    const cardDateTime = new Date(dateString);
    const now = new Date();
    
    // Check if the date is valid
    if (isNaN(cardDateTime.getTime())) {
      console.warn('Invalid date string for card display:', dateString);
      return 'Invalid date';
    }
    
    switch (category) {
      case 'upcoming':
        // Use consistent formatDateTimeForDisplay for upcoming cards (no seconds, no timezone)
        return formatDateTimeForDisplay(dateString);
        
      case 'dueSoon':
        // Show "Due in X" format
        const diffMs = cardDateTime.getTime() - now.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        
        if (diffHours > 0) {
          return `Due in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
        } else if (diffMinutes > 0) {
          return `Due in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
        } else {
          return 'Due now';
        }
        
      case 'dueNow':
        // Show "Due now" for cards due now
        return 'Due now';
        
      case 'overdue':
        // Show "Overdue by X" format
        const overdueMs = now.getTime() - cardDateTime.getTime();
        const overdueMinutes = Math.floor(overdueMs / (1000 * 60));
        const overdueHours = Math.floor(overdueMinutes / 60);
        const overdueDays = Math.floor(overdueHours / 24);
        
        if (overdueDays > 0) {
          return `Overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''}`;
        } else if (overdueHours > 0) {
          return `Overdue by ${overdueHours} hour${overdueHours > 1 ? 's' : ''}`;
        } else if (overdueMinutes > 0) {
          return `Overdue by ${overdueMinutes} minute${overdueMinutes > 1 ? 's' : ''}`;
        } else {
          return 'Overdue by less than a minute';
        }
        
      default:
        return formatDateTimeForDisplay(dateString);
    }
  } catch (error) {
    console.warn('Error formatting time for card display:', error);
    return formatDateTimeForDisplay(dateString);
  }
}; 