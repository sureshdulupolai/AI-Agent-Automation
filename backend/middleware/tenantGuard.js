import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'omnibot-super-secret-jwt-key-2026';

/**
 * Tenant Isolation Guard Middleware
 * Verifies JWT session token and binds authenticated tenant information to req.tenant
 * to strictly prevent unauthorized cross-tenant data access.
 */
export function tenantGuard(options = { required: true }) {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || req.headers.Authorization;
      let token = null;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      } else if (req.query && req.query.token) {
        token = req.query.token;
      }

      if (!token) {
        if (!options.required) {
          req.tenant = { id: 'default-tenant', email: 'guest@novabyte.ai', role: 'guest' };
          return next();
        }
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: Missing tenant authentication token'
        });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      req.tenant = {
        id: decoded.id || decoded.userId || decoded.tenantId || 'tenant-default',
        email: decoded.email || 'user@novabyte.ai',
        role: decoded.role || 'owner'
      };

      // Expose tenantId on request
      req.tenantId = req.tenant.id;
      next();
    } catch (err) {
      if (!options.required) {
        req.tenant = { id: 'default-tenant', email: 'guest@novabyte.ai', role: 'guest' };
        return next();
      }
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Invalid or expired tenant session token'
      });
    }
  };
}

/**
 * Scope Query Helper
 * Attaches tenant_id filter to database operations
 */
export function scopeQuery(req, query = {}) {
  const tenantId = req.tenant?.id || req.tenantId || 'default-tenant';
  return { ...query, tenant_id: tenantId };
}
