import diskcache

# Initialize disk cache for LLM extraction caching
cache = diskcache.Cache("./llm_cache")

def get_from_cache(key: str):
    return cache.get(key)

def set_in_cache(key: str, value, expire=None):
    cache.set(key, value, expire=expire)
