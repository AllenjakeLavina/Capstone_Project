"use strict";
/**
 * Password validation utility
 * Validates password strength with the following requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 lowercase letter (a-z)
 * - At least 1 number (0-9)
 * - At least 1 special character (any non-alphanumeric character)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PASSWORD_REGEX = exports.validatePassword = void 0;
/**
 * Validates password strength
 * @param password - The password to validate
 * @returns Validation result with isValid flag and array of error messages
 */
const validatePassword = (password) => {
    const errors = [];
    // Check minimum length
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter (a-z)');
    }
    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter (A-Z)');
    }
    // Check for at least one number
    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number (0-9)');
    }
    // Check for at least one special character (any non-alphanumeric)
    if (!/[^a-zA-Z\d]/.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&* etc.)');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validatePassword = validatePassword;
/**
 * Password regex pattern for validation
 * Allows all special characters (any non-alphanumeric character)
 */
exports.PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;
