/**
 * Storage unit definitions (binary units)
 */
const STORAGE_UNITS = [
  { unit: "B", bytes: 1 },
  { unit: "KB", bytes: 1024 },
  { unit: "MB", bytes: 1024 ** 2 },
  { unit: "GB", bytes: 1024 ** 3 },
  { unit: "TB", bytes: 1024 ** 4 },
  { unit: "PB", bytes: 1024 ** 5 },
  { unit: "EB", bytes: 1024 ** 6 },
  { unit: "ZB", bytes: 1024 ** 7 },
  { unit: "YB", bytes: 1024 ** 8 },
  { unit: "RB", bytes: 1024 ** 9 },
] as const;

/**
 * Options for formatting sizes
 */
interface FormatSizeOptions {
  /**
   * Number of decimal places to display (default: 2)
   */
  decimals?: number;
  /**
   * Use decimal (SI) units (1 KB = 1000 bytes) instead of binary units (1 KiB = 1024 bytes)
   * (default: false - uses binary units)
   */
  decimal?: boolean;
}

/**
 * Formats a byte size into a human-readable string with appropriate units
 * @param bytes - The number of bytes to format
 * @param options - Formatting options
 * @returns A formatted string with the size and unit (e.g., "1.5 MB")
 */
export function formatSize(
  bytes: number,
  options: FormatSizeOptions = {},
): string {
  const { decimals = 2, decimal = false } = options;

  if (bytes === 0) return "0 B";
  if (bytes < 0) return formatSize(Math.abs(bytes), options);

  const divisor = decimal ? 1000 : 1024;

  let unitIndex = 0;
  let size = bytes;

  while (size >= divisor && unitIndex < STORAGE_UNITS.length - 1) {
    size /= divisor;
    unitIndex++;
  }

  const unit = STORAGE_UNITS[unitIndex];
  const formatted = size.toFixed(decimals);

  // Remove trailing zeros and decimal point if not needed
  const trimmed = formatted.replace(/\.?0+$/, "");

  return `${trimmed} ${unit?.unit}`;
}

/**
 * Formats a byte size into a human-readable string with binary units (KiB, MiB, etc.)
 * @param bytes - The number of bytes to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns A formatted string with the size and unit (e.g., "1.5 MiB")
 */
export function formatSizeBinary(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 B";
  if (bytes < 0) return formatSizeBinary(Math.abs(bytes), decimals);

  const units = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"];
  let unitIndex = 0;
  let size = bytes;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  const formatted = size.toFixed(decimals);
  const trimmed = formatted.replace(/\.?0+$/, "");

  return `${trimmed} ${units[unitIndex]}`;
}

/**
 * Formats a byte size into a human-readable string with decimal units (KB, MB, etc.)
 * @param bytes - The number of bytes to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns A formatted string with the size and unit (e.g., "1.5 MB")
 */
export function formatSizeDecimal(bytes: number, decimals: number = 2): string {
  return formatSize(bytes, { decimals, decimal: true });
}

/**
 * Converts a formatted size string back to bytes
 * @param sizeString - A formatted size string (e.g., "1.5 MB", "256 KiB")
 * @returns The number of bytes, or null if the string is invalid
 */
export function parseSize(sizeString: string): number | null {
  const trimmed = sizeString.trim().toUpperCase();
  const match = trimmed.match(/^([\d.]+)\s*([A-Z]+)$/);

  if (!match) return null;

  const [, valueStr, unitStr] = match as RegExpMatchArray;

  if (!valueStr) return null;
  const value = parseFloat(valueStr);

  if (Number.isNaN(value)) return null;

  // Check binary units first
  const binaryUnits: Record<string, number> = {
    B: 1,
    KIB: 1024,
    MIB: 1024 ** 2,
    GIB: 1024 ** 3,
    TIB: 1024 ** 4,
    PIB: 1024 ** 5,
  };

  // Check decimal units
  const decimalUnits: Record<string, number> = {
    B: 1,
    KB: 1000,
    MB: 1000 ** 2,
    GB: 1000 ** 3,
    TB: 1000 ** 4,
    PB: 1000 ** 5,
  };

  if (!unitStr) return null;

  const multiplier: number | undefined =
    binaryUnits[unitStr] ?? decimalUnits[unitStr];

  if (!multiplier) return null;

  return Math.round(value * multiplier);
}
