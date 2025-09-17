import {
  getCachedInstitutionList,
  clearInstitutionCache,
  getInstitutionCacheStatus,
} from "./institutionCacheManager";

describe("InstitutionCacheManager", () => {
  beforeEach(() => {
    clearInstitutionCache();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getCachedInstitutionList", () => {
    it("should fetch institutions from database", async () => {
      expect(getInstitutionCacheStatus().exists).toBe(false);

      const result = await getCachedInstitutionList();

      expect(Array.isArray(result)).toBe(true);
      expect(getInstitutionCacheStatus().exists).toBe(true);
      expect(getInstitutionCacheStatus().valid).toBe(true);
    });

    it("should return cached data on subsequent calls within TTL", async () => {
      const result1 = await getCachedInstitutionList();
      const status1 = getInstitutionCacheStatus();
      expect(status1.exists).toBe(true);
      expect(status1.valid).toBe(true);

      const result2 = await getCachedInstitutionList();
      const status2 = getInstitutionCacheStatus();

      expect(result1).toEqual(result2);
      expect(status2.exists).toBe(true);
      expect(status2.valid).toBe(true);
      expect(status2.timestamp).toBe(status1.timestamp);
    });

    it("should refresh cache after TTL expires", async () => {
      jest.useFakeTimers();
      const mockTime = 1000000;
      jest.setSystemTime(mockTime);

      // First call - creates cache
      await getCachedInstitutionList();
      const status1 = getInstitutionCacheStatus();
      expect(status1.exists).toBe(true);
      expect(status1.valid).toBe(true);
      expect(status1.timestamp).toBe(mockTime);

      // Advance time beyond 5 minutes
      jest.advanceTimersByTime(300001);

      // Cache should now be invalid but still exist
      const statusExpired = getInstitutionCacheStatus();
      expect(statusExpired.exists).toBe(true);
      expect(statusExpired.valid).toBe(false);
      expect(statusExpired.age).toBe(300001);

      // Second call should refresh the cache
      await getCachedInstitutionList();
      const status2 = getInstitutionCacheStatus();
      expect(status2.exists).toBe(true);
      expect(status2.valid).toBe(true);
      expect(status2.timestamp).toBe(mockTime + 300001); // Should be fresh

      jest.useRealTimers();
    });
  });

  describe("clearInstitutionCache", () => {
    it("should clear existing cache", async () => {
      await getCachedInstitutionList();

      const statusBefore = getInstitutionCacheStatus();
      expect(statusBefore.exists).toBe(true);

      clearInstitutionCache();

      const statusAfter = getInstitutionCacheStatus();
      expect(statusAfter.exists).toBe(false);
    });

    it("should force fresh database fetch after clearing", async () => {
      await getCachedInstitutionList();
      expect(getInstitutionCacheStatus().exists).toBe(true);

      clearInstitutionCache();
      expect(getInstitutionCacheStatus().exists).toBe(false);

      const beforeRefetch = Date.now();
      await getCachedInstitutionList();
      const statusAfterRefetch = getInstitutionCacheStatus();
      expect(statusAfterRefetch.exists).toBe(true);
      expect(statusAfterRefetch.valid).toBe(true);
      expect(statusAfterRefetch.timestamp).toBeGreaterThanOrEqual(
        beforeRefetch,
      ); // Should be fresh timestamp
    });
  });

  describe("getInstitutionCacheStatus", () => {
    it("should return false when cache is empty", () => {
      const status = getInstitutionCacheStatus();
      expect(status).toEqual({ exists: false });
    });

    it("should return cache information when populated", async () => {
      const startTime = Date.now();
      await getCachedInstitutionList();
      const endTime = Date.now();

      const status = getInstitutionCacheStatus();

      expect(status.exists).toBe(true);
      expect(status.valid).toBe(true);
      expect(typeof status.age).toBe("number");
      expect(status.age).toBeGreaterThanOrEqual(0);
      expect(status.age).toBeLessThan(endTime - startTime + 100); // Allow some margin
    });

    it("should show invalid status when cache expires", async () => {
      jest.useFakeTimers();
      const mockTime = 1000000;
      jest.setSystemTime(mockTime);

      // Create cache
      await getCachedInstitutionList();

      // Advance time beyond TTL
      jest.advanceTimersByTime(300001);

      const status = getInstitutionCacheStatus();
      expect(status.exists).toBe(true);
      expect(status.valid).toBe(false);
      expect(status.age).toBe(300001);

      jest.useRealTimers();
    });
  });

  describe("Cache TTL behavior", () => {
    it("should respect 5-minute (300 second) TTL", async () => {
      jest.useFakeTimers();
      const startTime = 1000000;
      jest.setSystemTime(startTime);

      await getCachedInstitutionList();

      // Test just under 5 minutes - should use cache
      jest.advanceTimersByTime(299000);
      const statusBeforeExpiry = getInstitutionCacheStatus();
      expect(statusBeforeExpiry.valid).toBe(true);

      await getCachedInstitutionList();
      const statusAfterCall1 = getInstitutionCacheStatus();
      expect(statusAfterCall1.valid).toBe(true);
      expect(statusAfterCall1.timestamp).toBe(startTime); // Should still be original cache

      // Test exactly 5 minutes - should refresh
      jest.advanceTimersByTime(1000); // Total: 300000ms (5 minutes)
      const statusAtExpiry = getInstitutionCacheStatus();
      expect(statusAtExpiry.valid).toBe(false);

      await getCachedInstitutionList();
      const statusAfterRefresh = getInstitutionCacheStatus();
      expect(statusAfterRefresh.valid).toBe(true);
      expect(statusAfterRefresh.timestamp).toBe(startTime + 300000); // Should be fresh cache

      jest.useRealTimers();
    });
  });
});
