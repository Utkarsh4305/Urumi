import crypto from 'crypto';

/**
 * Generate a random alphanumeric store ID
 * @param length Length of the ID (default: 12)
 * @returns Random hex string
 */
export function generateStoreId(length: number = 12): string {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

/**
 * Generate a secure random password
 * @param length Length of the password (default: 24)
 * @returns Base64-encoded random string
 */
export function generatePassword(length: number = 24): string {
  return crypto.randomBytes(Math.ceil(length * 3 / 4)).toString('base64').slice(0, length);
}

/**
 * Generate a namespace name from store ID
 * @param storeId Store ID
 * @returns Kubernetes-compatible namespace name
 */
export function generateNamespace(storeId: string): string {
  return `store-${storeId}`;
}
