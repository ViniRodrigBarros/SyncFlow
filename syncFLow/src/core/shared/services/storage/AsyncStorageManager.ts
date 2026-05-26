import AsyncStorage from '@react-native-async-storage/async-storage';

export class AsyncStorageManager {
  async getString(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  }

  async setString(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  }

  async getObject<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async setObject<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }

  async has(key: string): Promise<boolean> {
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  }

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  }
}

export const asyncStorageManager = new AsyncStorageManager();
