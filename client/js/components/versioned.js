// Versioned handler dispatch utility
// Usage: dispatchVersionedHandler(handlers, requestedMajor, requestedRev, ...args)

function dispatchVersionedHandler(handlers, requestedMajor = 0, requestedRev = 0, ...args) {
  if (!Array.isArray(handlers)) return handlers;

  // Sort handlers by major, then rev, descending
  handlers.sort((a, b) => b.major - a.major || b.rev - a.rev);

  let lastError = null;
  for (const handler of handlers) {
    if (
      handler.major < requestedMajor ||
      (handler.major === requestedMajor && handler.rev <= requestedRev)
    ) {
      try {
        return handler.fun(...args);
      } catch (err) {
        lastError = err;
        // Log to Datadog if available
        if (typeof datadog !== 'undefined' && datadog.logger) {
          datadog.logger.error(`Versioned handler v${handler.major}_${handler.rev} failed: ${err}`);
        }
        continue;
      }
    }
  }
  // If all fail, log to console
  if (lastError) {
    console.error('All versioned handlers failed:', lastError);
  }
  throw new Error('No compatible handler found for the requested version.');
}

module.exports = dispatchVersionedHandler; 