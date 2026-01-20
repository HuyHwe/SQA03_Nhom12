package com.resourceservice.utilsmodule;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CacheService {
    private static final Logger LOGGER = LoggerFactory.getLogger(CacheService.class);

    private final CacheManager cacheManager;

    @Value("${cache.autoClear:false}")
    private boolean autoClear;

    /**
     * Clear or evict a cache with cacheKey
     * @param cacheManager
     * @param cacheName
     * @param cacheKey
     */
    public void evictSingleCacheValue(CacheManager cacheManager, String cacheName, String cacheKey) {
        if (cacheManager == null || cacheName == null || cacheKey == null) {
            LOGGER.warn("Invalid parameters for evictSingleCacheValue: cacheManager={}, cacheName={}, cacheKey={}",
                    cacheManager, cacheName, cacheKey);
            return;
        }
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.evict(cacheKey);
            LOGGER.info("Evicted cache key: {} from cache: {}", cacheKey, cacheName);
        } else {
            LOGGER.warn("Cache not found for cacheName: {}", cacheName);
        }
    }

    /**
     * Clear or evict all cache with cacheName
     * @param cacheManager
     * @param cacheName
     */
    public void evictAllCacheValues(CacheManager cacheManager, String cacheName) {
        if (cacheManager == null || cacheName == null) {
            LOGGER.warn("Invalid parameters for evictAllCacheValues: cacheManager={}, cacheName={}",
                    cacheManager, cacheName);
            return;
        }
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.clear();
            LOGGER.info("Cleared all entries in cache: {}", cacheName);
        } else {
            LOGGER.warn("Cache not found for cacheName: {}", cacheName);
        }
    }

    /**
     * Clear all caches
     * @param cacheManager
     */
    public void evictAllCaches(CacheManager cacheManager) {
        if (cacheManager == null) {
            LOGGER.warn("CacheManager is null in evictAllCaches");
            return;
        }
        cacheManager.getCacheNames().forEach(cacheName -> {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.clear();
                LOGGER.info("Cleared cache: {}", cacheName);
            }
        });
    }

    @Scheduled(fixedRate = 6000)
    public void evictAllCachesAtIntervals() {
        if(autoClear) {
          evictAllCaches(cacheManager);
        }
    }

    /**
     * Put data into cache
     * @param cacheManager
     * @param cacheName
     * @param cacheKey
     * @param data
     */
    public void putCache(CacheManager cacheManager, String cacheName, String cacheKey, Object data) {
        if (cacheManager == null || cacheName == null || cacheKey == null) {
            LOGGER.warn("Invalid parameters for putCache: cacheManager={}, cacheName={}, cacheKey={}",
                    cacheManager, cacheName, cacheKey);
            return;
        }
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.put(cacheKey, data);
            LOGGER.info("Stored data in cache: {} with key: {}", cacheName, cacheKey);
        } else {
            LOGGER.warn("Cache not found for cacheName: {}", cacheName);
        }
    }

    /**
     * Get data from cache
     * @param cacheManager
     * @param cacheName
     * @param cacheKey
     * @return cached value or null if not found
     */
    public <T> T getCache(CacheManager cacheManager, String cacheName, String cacheKey) {
        if (cacheManager == null || cacheName == null || cacheKey == null) {
            LOGGER.warn("Invalid parameters for getCache: cacheManager={}, cacheName={}, cacheKey={}",
                    cacheManager, cacheName, cacheKey);
            return null;
        }
        Cache cache = cacheManager.getCache(cacheName);
        if (cache == null) {
            LOGGER.warn("Cache not found for cacheName: {}", cacheName);
            return null;
        }
        Cache.ValueWrapper valueWrapper = cache.get(cacheKey);
        if (valueWrapper == null) {
            LOGGER.debug("No value found in cache: {} for key: {}", cacheName, cacheKey);
            return null;
        }
        return (T) valueWrapper.get();
    }
    public <T> T adminGetCache(CacheManager cacheManager, String cacheName, String cacheKey) {
        if (cacheManager == null || cacheName == null || cacheKey == null) {
            LOGGER.warn("Invalid parameters for getCache: cacheManager={}, cacheName={}, cacheKey={}",
                    cacheManager, cacheName, cacheKey);
            return null;
        }
        Cache cache = cacheManager.getCache(cacheName);
        if (cache == null) {
            LOGGER.warn("Cache not found for cacheName: {}", cacheName);
            return null;
        }
        Cache.ValueWrapper valueWrapper = cache.get(cacheKey);
        if (valueWrapper == null) {
            LOGGER.debug("No value found in cache: {} for key: {}", cacheName, cacheKey);
            return null;
        }
        return (T) valueWrapper.get();
    }

    /**
     * Check if a key exists in cache
     * @param cacheManager
     * @param cacheName
     * @param cacheKey
     * @return true if key exists, false otherwise
     */
    public boolean isExistedInCache(CacheManager cacheManager, String cacheName, String cacheKey) {
        if (cacheManager == null || cacheName == null || cacheKey == null) {
            LOGGER.warn("Invalid parameters for isExistedInCache: cacheManager={}, cacheName={}, cacheKey={}",
                    cacheManager, cacheName, cacheKey);
            return false;
        }
        Cache cache = cacheManager.getCache(cacheName);
        if (cache == null) {
            LOGGER.warn("Cache not found for cacheName: {}", cacheName);
            return false;
        }
        return cache.get(cacheKey) != null;
    }
}