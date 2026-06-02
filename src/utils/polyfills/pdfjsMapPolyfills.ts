type MapWithGetOrInsert<K, V> = Map<K, V> & {
  getOrInsert?: (key: K, value: V) => V;
  getOrInsertComputed?: (key: K, callback: () => V) => V;
};

const mapPrototype = Map.prototype as MapWithGetOrInsert<unknown, unknown>;

if (typeof mapPrototype.getOrInsert !== 'function') {
  Object.defineProperty(mapPrototype, 'getOrInsert', {
    configurable: true,
    writable: true,
    value: function getOrInsert<K, V>(this: Map<K, V>, key: K, value: V): V {
      if (this.has(key)) {
        return this.get(key) as V;
      }

      this.set(key, value);
      return value;
    },
  });
}

if (typeof mapPrototype.getOrInsertComputed !== 'function') {
  Object.defineProperty(mapPrototype, 'getOrInsertComputed', {
    configurable: true,
    writable: true,
    value: function getOrInsertComputed<K, V>(
      this: Map<K, V>,
      key: K,
      callback: () => V
    ): V {
      if (this.has(key)) {
        return this.get(key) as V;
      }

      const value = callback();
      this.set(key, value);
      return value;
    },
  });
}
