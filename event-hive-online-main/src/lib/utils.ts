
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateString(dateString: string | Date): string {
  try {
    if (typeof dateString === 'string') {
      // Try to parse ISO string
      const date = parseISO(dateString);
      return format(date, "PPP");
    } else {
      // Handle Date object
      return format(dateString, "PPP");
    }
  } catch (error) {
    // Fallback for other string formats
    try {
      return format(new Date(dateString), "PPP");
    } catch (err) {
      console.error("Date formatting error:", err);
      return String(dateString); // Return as is if all formatting fails
    }
  }
}

export function handleFirebaseError(error: any): string {
  console.error("Firebase error:", error);
  
  // Extract error message if available
  const errorCode = error?.code || '';
  const errorMessage = error?.message || 'An unknown error occurred';
  
  // Map common Firebase error codes to user-friendly messages
  if (errorCode.includes('auth/')) {
    if (errorCode.includes('user-not-found')) {
      return 'No account found with this email address';
    } else if (errorCode.includes('wrong-password')) {
      return 'Incorrect password';
    } else if (errorCode.includes('email-already-in-use')) {
      return 'An account with this email already exists';
    } else if (errorCode.includes('weak-password')) {
      return 'Password is too weak. Use at least 6 characters';
    } else if (errorCode.includes('invalid-email')) {
      return 'Invalid email address format';
    }
  }
  
  return errorMessage;
}
