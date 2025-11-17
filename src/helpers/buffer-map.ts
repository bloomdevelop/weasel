/**
 * A hybrid data structure that combines a Map for efficient lookups with a Buffer for serialization.
 *
 * BufferMap maintains both:
 * - A Map for fast O(1) key-value lookups
 * - A Buffer that grows dynamically to store serialized key-value pairs
 *
 * Each entry is stored in the buffer in the format: `key:value;` (UTF-8 encoded).
 * The buffer automatically expands by 2x when needed.
 *
 * @template K - Key type (string or number)
 * @template V - Value type
 *
 * @example
 * ```typescript
 * const bufferMap = new BufferMap<string, object>(1024);
 * bufferMap
 *   .set("user1", { name: "Alice", age: 30 })
 *   .set("user2", { name: "Bob", age: 25 });
 *
 * console.log(bufferMap.get("user1")); // { name: "Alice", age: 30 }
 * console.log(bufferMap.getRawBufferHex()); // hex representation of buffer
 * ```
 */
export class BufferMap<K extends string | number, V> {
  private buffer: Buffer;
  private store = new Map<K, V>();
  private maxSize: number;
  private currentPosition: number;

  /**
   * Creates a new BufferMap instance
   * @param initialSize - Initial buffer size in bytes (default: 1024)
   */
  constructor(initialSize: number = 1024) {
    this.maxSize = initialSize;
    this.buffer = Buffer.alloc(initialSize);
    this.currentPosition = 0;
  }

  /**
   * Sets a key-value pair in the map and buffer
   * Automatically expands the buffer if needed
   * @param key - The key to set
   * @param value - The value to set
   * @returns The BufferMap instance for method chaining
   */
  set(key: K, value: V): this {
    const keyStr = String(key);
    const valueStr = JSON.stringify(value);
    const data = `${keyStr}:${valueStr};`;
    const dataBuffer = Buffer.from(data, "utf-8");

    // Expand buffer if needed
    if (this.currentPosition + dataBuffer.length > this.maxSize) {
      const newSize = Math.max(
        this.maxSize * 2,
        this.currentPosition + dataBuffer.length,
      );
      const newBuffer = Buffer.alloc(newSize);
      this.buffer.copy(newBuffer);
      this.buffer = newBuffer;
      this.maxSize = newSize;
    }

    dataBuffer.copy(this.buffer, this.currentPosition);
    this.currentPosition += dataBuffer.length;
    this.store.set(key, value);
    return this;
  }

  /**
   * Gets a value by key from the map
   * @param key - The key to retrieve
   * @returns The value associated with the key, or undefined if not found
   */
  get(key: K): V | undefined {
    return this.store.get(key);
  }

  /**
   * Checks if a key exists in the map
   * @param key - The key to check
   * @returns True if the key exists, false otherwise
   */
  has(key: K): boolean {
    return this.store.has(key);
  }

  /**
   * Deletes a key-value pair from the map
   * Note: This only removes from the Map, not from the Buffer
   * @param key - The key to delete
   * @returns True if the key was deleted, false if it didn't exist
   */
  delete(key: K): boolean {
    return this.store.delete(key);
  }

  /**
   * Clears all entries from the map and resets the buffer
   */
  clear(): void {
    this.store.clear();
    this.buffer = Buffer.alloc(this.maxSize);
    this.currentPosition = 0;
  }

  /**
   * Gets the number of entries in the map
   */
  get size(): number {
    return this.store.size;
  }

  /**
   * Gets the used portion of the buffer (excluding unused space)
   * @returns A Buffer containing only the used bytes
   */
  getBuffer(): Buffer {
    return this.buffer.subarray(0, this.currentPosition);
  }

  /**
   * Gets the raw buffer containing all serialized entries
   * @returns A Buffer containing only the used bytes
   */
  getRawBuffer(): Buffer {
    return this.buffer.subarray(0, this.currentPosition);
  }

  /**
   * Gets the hex representation of the used buffer
   * @returns Hex string representation of the buffer
   */
  getRawBufferHex(): string {
    return this.buffer.subarray(0, this.currentPosition).toString("hex");
  }

  /**
   * Gets an iterator of all keys
   * @returns An iterator of keys
   */
  keys(): IterableIterator<K> {
    return this.store.keys();
  }

  /**
   * Gets an iterator of all values
   * @returns An iterator of values
   */
  values(): IterableIterator<V> {
    return this.store.values();
  }

  /**
   * Gets an iterator of all entries
   * @returns An iterator of [key, value] tuples
   */
  entries(): IterableIterator<[K, V]> {
    return this.store.entries();
  }

  /**
   * Iterates over all entries in the map
   * @param callback - Function to call for each entry
   * @param thisArg - Optional this context for the callback
   */
  forEach(
    callback: (value: V, key: K, map: this) => void,
    thisArg?: any,
  ): void {
    this.store.forEach((value, key) => {
      callback.call(thisArg, value, key, this);
    });
  }

  /**
   * Makes the BufferMap iterable
   * @returns An iterator of [key, value] tuples
   */
  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.store[Symbol.iterator]();
  }
}
