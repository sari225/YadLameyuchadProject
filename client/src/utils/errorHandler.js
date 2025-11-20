/**
 * מרכז טיפול בשגיאות - מנע כפילות קוד ומבטיח עקביות הודעות
 * Error Handler Utility - Prevents code duplication and ensures consistent error messages
 */

/**
 * מפרסר הודעות שגיאה מהשרת ומחזיר הודעה ידידותית למשתמש
 * @param {Object} error - אובייקט השגיאה מהשרת
 * @param {string} defaultMessage - הודעה דיפולטית במידה ולא זוהתה שגיאה ספציפית
 * @returns {string} הודעת שגיאה ידידותית למשתמש
 */
export const parseServerError = (error, defaultMessage = "❌ אירעה שגיאה לא צפויה. אנא נסה שוב.") => {
  // חילוץ הודעת השגיאה ממבנה השגיאה
  const errorMessage = error?.data?.message || error?.message || '';
  const errorDetail = typeof error?.data?.error === "string" 
    ? error.data.error 
    : JSON.stringify(error?.data?.error || "");
  const fullErrorText = `${errorMessage} ${errorDetail}`.toLowerCase();
  
  // שגיאות מסד נתונים - ערכים כפולים (Duplicate entries)
  if (isDuplicateError(errorMessage, fullErrorText)) {
    return handleDuplicateError(errorMessage, fullErrorText);
  }
  
  // שגיאות תאריך לידה עתידי
  if (isFutureDateError(errorMessage, fullErrorText)) {
    return "❌ תאריך הלידה לא יכול להיות עתידי. אנא בחר תאריך תקין.";
  }
  
  // שגיאות אימות נתונים
  if (isValidationError(error)) {
    return handleValidationError(error);
  }
  
  // שגיאות הרשאה
  if (isAuthorizationError(error)) {
    return handleAuthorizationError(error, errorMessage, fullErrorText);
  }
  
  // שגיאות לא נמצא (404)
  if (isNotFoundError(error)) {
    return handleNotFoundError(error, errorMessage, fullErrorText);
  }
  
  // שגיאות רשת/שרת
  if (isNetworkError(error)) {
    return "❌ בעיית תקשורת עם השרת. אנא בדוק את החיבור לאינטרנט ונסה שוב.";
  }
  
  // שגיאות שרת כלליות
  if (isServerError(error)) {
    return handleServerError(error, errorMessage, fullErrorText);
  }
  
  // שגיאות הרשמה כפולה לקייטנות/חוגים
  if (isAlreadyRegisteredError(errorMessage, fullErrorText)) {
    return "❌ אתה כבר רשום לפעילות זו.";
  }
  
  // החזרת ההודעה המקורית או ברירת המחדל
  return errorMessage || defaultMessage;
};

/**
 * בדיקה אם השגיאה קשורה לערכים כפולים במסד הנתונים
 */
const isDuplicateError = (errorMessage, fullErrorText) => {
  const duplicateIndicators = [
    'duplicate', 'unique', 'e11000', 'already exists',
    'כבר קיים', 'כבר רשום', 'כפול'
  ];
  
  return duplicateIndicators.some(indicator => 
    fullErrorText.includes(indicator) || errorMessage.includes(indicator)
  );
};

/**
 * טיפול בשגיאות ערכים כפולים
 */
const handleDuplicateError = (errorMessage, fullErrorText) => {
  // בדיקה ספציפית לאימייל
  if (fullErrorText.includes('email') || errorMessage.includes('Email')) {
    return "❌ כתובת האימייל כבר רשומה במערכת. אנא השתמש בכתובת אחרת או נסה להתחבר.";
  }
  
  // בדיקה ספציפית למספר ת"ז/ילד
  if (fullErrorText.includes('childid') || errorMessage.includes('childId') || 
      fullErrorText.includes('ת"ז') || fullErrorText.includes('זהות')) {
    return "❌ מספר תעודת הזהות כבר רשום במערכת. אם זה הילד שלך, נסה להתחבר או פנה לתמיכה.";
  }
  
  // בדיקה ספציפית לת"ז מתנדבת
  if (fullErrorText.includes('id_') || fullErrorText.includes('volunteers') || 
      (fullErrorText.includes('id') && fullErrorText.includes('duplicate'))) {
    return "❌ תעודת הזהות של המתנדבת כבר רשומה במערכת. אנא בדקי את מספר ת\"ז ונסי שוב.";
  }
  
  // שגיאה כללית לכפילות
  return "❌ הפרטים שהוזנו כבר קיימים במערכת. אנא בדוק את הנתונים ונסה שוב.";
};

/**
 * בדיקה אם השגיאה קשורה לתאריך לידה עתידי
 */
const isFutureDateError = (errorMessage, fullErrorText) => {
  const futureDateIndicators = [
    'תאריך לידה לא יכול להיות עתידי',
    'dateofbirth', 'future date', 'תאריך עתידי'
  ];
  
  return futureDateIndicators.some(indicator => 
    fullErrorText.includes(indicator) || errorMessage.includes(indicator)
  );
};

/**
 * בדיקה אם השגיאה קשורה לאימות נתונים
 */
const isValidationError = (error) => {
  return error?.status === 400 || error?.data?.name === 'ValidationError';
};

/**
 * טיפול בשגיאות אימות נתונים
 */
const handleValidationError = (error) => {
  const validationErrors = error?.data?.details || error?.data?.errors;
  
  if (validationErrors && typeof validationErrors === 'object') {
    // החזרת השגיאה הראשונה מרשימת שגיאות האימות
    const firstError = Object.values(validationErrors)[0];
    return `❌ ${firstError?.message || 'נתונים לא תקינים'}`;
  }
  
  return "❌ הנתונים שהוזנו אינם תקינים. אנא בדוק את השדות ונסה שוב.";
};

/**
 * בדיקה אם השגיאה קשורה להרשאות
 */
const isAuthorizationError = (error) => {
  return error?.status === 401 || error?.status === 403;
};

/**
 * טיפול בשגיאות הרשאה - מחזיר הודעה ספציפית לפי הסיבה
 */
const handleAuthorizationError = (error, errorMessage, fullErrorText) => {
  // בדיקה ספציפית לחשבון לא מאושר (שכחתי סיסמה)
  if (errorMessage.includes("User not approved") || errorMessage.includes("not approved")) {
    return "❌ החשבון שלך עדיין לא מאושר על ידי מנהל המערכת. לא ניתן לאפס סיסמה עד לאישור החשבון.";
  }
  
  // בדיקה ספציפית לחשבון לא מאושר (כניסה רגילה או גוגל)
  if (errorMessage.includes("pending approval") || errorMessage.includes("Account pending")) {
    return "❌ החשבון שלך עדיין ממתין לאישור מנהל המערכת. אנא המתן עד לאישור.";
  }
  
  // בדיקה ספציפית למשתמש לא נמצא בגוגל לוגין
  if (errorMessage.includes("User not found") || errorMessage.includes("Please register first")) {
    return "❌ המשתמש לא נמצא במערכת. אנא הירשם תחילה או בדוק את כתובת המייל.";
  }
  
  // שגיאה כללית של הרשאה
  return "❌ אין לך הרשאה לבצע פעולה זו.";
};

/**
 * בדיקה אם השגיאה היא 404 - לא נמצא
 */
const isNotFoundError = (error) => {
  return error?.status === 404;
};

/**
 * טיפול בשגיאות לא נמצא
 */
const handleNotFoundError = (error, errorMessage, fullErrorText) => {
  // בדיקה ספציפית לשכחתי סיסמה - מייל לא נמצא
  if (errorMessage.includes("Email not found")) {
    return "❌ כתובת המייל לא נמצאה במערכת. אנא בדוק את הכתובת או הירשם תחילה.";
  }
  
  // בדיקה ספציפית לגוגל לוגין - משתמש לא נמצא
  if (errorMessage.includes("User not found") || errorMessage.includes("Please register first")) {
    return "❌ המשתמש לא נמצא במערכת. אנא הירשם תחילה באתר.";
  }
  
  // שגיאה כללית של לא נמצא
  return "❌ הפריט המבוקש לא נמצא.";
};

/**
 * בדיקה אם השגיאה קשורה לבעיות רשת
 */
const isNetworkError = (error) => {
  return !error?.status || error?.name === 'NetworkError' || error?.code === 'NETWORK_ERROR';
};

/**
 * בדיקה אם השגיאה היא שגיאת שרת (5xx)
 */
const isServerError = (error) => {
  return error?.status >= 500;
};

/**
 * טיפול בשגיאות שרת - תרגום הודעות שרת לעברית
 */
const handleServerError = (error, errorMessage, fullErrorText) => {
  // שגיאות יצירה/עדכון
  if (errorMessage.includes("Error creating") || errorMessage.includes("Error updating")) {
    if (fullErrorText.includes("volunteer")) {
      return "❌ שגיאה ביצירת/עדכון מתנדבת. אנא בדקי את הנתונים ונסי שוב.";
    }
    if (fullErrorText.includes("child")) {
      return "❌ שגיאה ביצירת/עדכון ילד. אנא בדקי את הנתונים ונסי שוב.";
    }
    return "❌ שגיאה בביצוע הפעולה. אנא נסה שוב.";
  }
  
  // שגיאת שרת כללית
  if (errorMessage.includes("Server error") || errorMessage.includes("Internal server error")) {
    return "❌ שגיאה פנימית בשרת. אנא נסה שוב או פנה לתמיכה.";
  }
  
  // שגיאה כללית
  return "❌ שגיאה בשרת. אנא נסה שוב.";
};

/**
 * בדיקה אם השגיאה קשורה להרשמה כפולה
 */
const isAlreadyRegisteredError = (errorMessage, fullErrorText) => {
  const alreadyRegisteredIndicators = [
    'already registered', 'כבר רשום', 'כבר נרשם'
  ];
  
  return alreadyRegisteredIndicators.some(indicator => 
    fullErrorText.includes(indicator) || errorMessage.includes(indicator)
  );
};

/**
 * פונקציית עזר ליצירת הודעת שגיאה מותאמת אישית
 * @param {string} field - השדה שבו אירעה השגיאה
 * @param {string} message - הודעה מותאמת אישית
 */
export const createCustomError = (field, message) => {
  return `❌ ${field}: ${message}`;
};

/**
 * פונקציית עזר לטיפול בשגיאות async/await
 * @param {Function} asyncFn - פונקציה אסינכרונית
 * @param {Function} errorHandler - פונקציית טיפול בשגיאה (אופציונלי)
 */
export const handleAsyncError = async (asyncFn, errorHandler = null) => {
  try {
    return await asyncFn();
  } catch (error) {
    const parsedError = parseServerError(error);
    
    if (errorHandler) {
      errorHandler(parsedError);
    }
    
    throw new Error(parsedError);
  }
};

/**
 * קונסטנטות של הודעות שגיאה נפוצות
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "❌ בעיית תקשורת עם השרת. אנא בדוק את החיבור לאינטרנט ונסה שוב.",
  UNAUTHORIZED: "❌ אין לך הרשאה לבצע פעולה זו.",
  NOT_APPROVED_PASSWORD_RESET: "❌ החשבון שלך עדיין לא מאושר על ידי מנהל המערכת. לא ניתן לאפס סיסמה עד לאישור החשבון.",
  NOT_APPROVED: "❌ החשבון שלך עדיין ממתין לאישור מנהל המערכת. אנא המתן עד לאישור.",
  USER_NOT_FOUND: "❌ המשתמש לא נמצא במערכת. אנא הירשם תחילה באתר.",
  EMAIL_NOT_FOUND: "❌ כתובת המייל לא נמצאה במערכת. אנא בדוק את הכתובת או הירשם תחילה.",
  VALIDATION_ERROR: "❌ הנתונים שהוזנו אינם תקינים. אנא בדוק את השדות ונסה שוב.",
  DUPLICATE_EMAIL: "❌ כתובת האימייל כבר רשומה במערכת. אנא השתמש בכתובת אחרת או נסה להתחבר.",
  DUPLICATE_ID: "❌ מספר תעודת הזהות כבר רשום במערכת. אם זה הילד שלך, נסה להתחבר או פנה לתמיכה.",
  FUTURE_DATE: "❌ תאריך הלידה לא יכול להיות עתידי. אנא בחר תאריך תקין.",
  ALREADY_REGISTERED: "❌ אתה כבר רשום לפעילות זו.",
  GENERIC_ERROR: "❌ אירעה שגיאה לא צפויה. אנא נסה שוב."
};

export default { parseServerError, createCustomError, handleAsyncError, ERROR_MESSAGES };