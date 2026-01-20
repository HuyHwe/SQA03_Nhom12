package com.paymentservice.utilsmodule;

import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class CacheService {

    /**
     * clear or evict a cache with cacheKey
     * @param cacheManager
     * @param cacheName
     * @param cacheKey
     */
    public void evictSingleCacheValue(CacheManager cacheManager, String cacheName, String cacheKey) {
        cacheManager.getCache(cacheName).evict(cacheKey);
    }

    /**
     * clear or evict all cache with cacheName
     * @param cacheManager
     * @param cacheName
     */
    public void evictAllCacheValues(CacheManager cacheManager, String cacheName) {
        cacheManager.getCache(cacheName).clear();
    }

    /**
     * clear all cache
     */
    public void evictAllCaches(CacheManager cacheManager) {
        cacheManager.getCacheNames().stream()
                .forEach(cacheName -> cacheManager.getCache(cacheName).clear());
    }

    @Scheduled(fixedRate = 6000)
    public void evictAllcachesAtIntervals(CacheManager cacheManager) {
        evictAllCaches(cacheManager);
    }

    public void putCache(CacheManager cacheManager, String cacheName, String cacheKey, Object data) {
        cacheManager.getCache(cacheName).put(cacheKey, data);
    }
    public <T> T getCache(CacheManager cacheManager, String cacheName, String cacheKey) {
        return (T) cacheManager.getCache(cacheName).get(cacheKey).get();
    }

    public boolean isExistedInCache(CacheManager cacheManager, String cacheName, String cacheKey) {
        return cacheManager.getCache(cacheName).get(cacheKey, (Class<Object>) null) != null;
    }
}
