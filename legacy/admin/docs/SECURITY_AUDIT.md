# Admin Panel - Security Audit Checklist

## Authentication & Authorization

### ✅ Completed
- [x] Google OAuth integration with proper redirect handling
- [x] Email/password authentication with Supabase Auth
- [x] Role-based access control (super_admin, ops_admin, read_only)
- [x] Protected routes with role validation
- [x] Session management with automatic refresh

### 🔍 To Verify
- [ ] **Test OAuth flow**: Verify Google sign-in works end-to-end
- [ ] **Test role restrictions**: Ensure read_only cannot access ServiceControl
- [ ] **Test session expiry**: Verify automatic logout after session expires
- [ ] **Test unauthorized access**: Try accessing admin panel without auth

### 🔒 Security Recommendations
1. **Enable 2FA**: Add two-factor authentication for super_admin accounts
2. **IP Whitelisting**: Consider restricting admin panel access to specific IPs
3. **Session Timeout**: Set appropriate session timeout (recommend 1 hour)
4. **Password Policy**: Enforce strong passwords (min 12 chars, complexity)

---

## Row Level Security (RLS)

### ✅ Implemented Policies
```sql
-- admin_users: Only authenticated admins can read
CREATE POLICY admin_users_policy ON admin_users
  FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- service_availability: Read for all admins, write for super_admin/ops_admin
CREATE POLICY service_availability_read ON service_availability
  FOR SELECT USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY service_availability_write ON service_availability
  FOR ALL USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() AND role IN ('super_admin', 'ops_admin')
  ));
```

### 🔍 To Verify
- [ ] **Test RLS bypass attempts**: Try accessing tables without proper role
- [ ] **Test cross-admin access**: Ensure admins can't modify other admin records
- [ ] **Test service_availability**: Verify read_only can view but not modify

---

## API Security

### ✅ Implemented
- [x] Supabase RLS enforces database-level security
- [x] All admin actions logged in audit_logs table
- [x] Service availability changes require reason field
- [x] WebSocket channels scoped to authenticated users

### 🔍 To Verify
- [ ] **Test rate limiting**: Verify Supabase rate limits are in place
- [ ] **Test SQL injection**: Attempt SQL injection in service toggle
- [ ] **Test XSS**: Try injecting scripts in reason field
- [ ] **Test CSRF**: Verify CSRF protection on state-changing operations

### 🔒 Security Recommendations
1. **API Rate Limiting**: Implement rate limiting on admin endpoints (100 req/min)
2. **Input Validation**: Add server-side validation for all inputs
3. **Sanitize Outputs**: Ensure all user inputs are sanitized before display
4. **Audit Log Retention**: Set retention policy for audit logs (recommend 1 year)

---

## Data Privacy & Compliance

### ✅ Implemented
- [x] Audit logs capture who/what/when for all actions
- [x] User sessions tracked with last_activity timestamp
- [x] Service availability changes logged with reason

### 🔍 To Verify
- [ ] **PII Handling**: Verify no sensitive PII exposed in logs
- [ ] **Data Retention**: Confirm old sessions are cleaned up (1 hour)
- [ ] **Audit Trail**: Verify all admin actions are logged

### 🔒 Compliance Recommendations
1. **GDPR Compliance**: Add data export/deletion capabilities
2. **Data Encryption**: Ensure data at rest is encrypted (Supabase default)
3. **Access Logs**: Maintain access logs for compliance audits
4. **Privacy Policy**: Update privacy policy to include admin monitoring

---

## WebSocket Security

### ✅ Implemented
- [x] WebSocket channels require authentication
- [x] Channels scoped to specific resources (bookings, sessions)
- [x] Automatic cleanup on disconnect

### 🔍 To Verify
- [ ] **Test unauthorized subscription**: Try subscribing without auth
- [ ] **Test channel isolation**: Verify admins can't access other channels
- [ ] **Test connection limits**: Verify max connections per user

### 🔒 Security Recommendations
1. **Connection Limits**: Limit WebSocket connections per admin (max 5)
2. **Heartbeat Monitoring**: Implement heartbeat to detect stale connections
3. **Message Validation**: Validate all WebSocket messages server-side

---

## Infrastructure Security

### ✅ Implemented
- [x] HTTPS enforced (Supabase default)
- [x] Environment variables for sensitive config
- [x] Database credentials not in code

### 🔍 To Verify
- [ ] **Test HTTPS enforcement**: Verify HTTP redirects to HTTPS
- [ ] **Test env variables**: Ensure no secrets in client bundle
- [ ] **Test CORS**: Verify CORS policy is restrictive

### 🔒 Security Recommendations
1. **WAF**: Consider adding Web Application Firewall
2. **DDoS Protection**: Implement DDoS protection (Cloudflare)
3. **Backup Strategy**: Ensure automated backups are enabled
4. **Disaster Recovery**: Document disaster recovery procedures

---

## Vulnerability Testing

### Manual Tests to Perform

#### 1. Authentication Bypass
```bash
# Try accessing admin panel without login
curl https://admin.thelokals.com/live-users

# Expected: 401 Unauthorized or redirect to login
```

#### 2. Privilege Escalation
```javascript
// Try modifying role in browser console
localStorage.setItem('admin_role', 'super_admin');

// Expected: Server-side validation should reject
```

#### 3. SQL Injection
```javascript
// Try injecting SQL in service toggle reason
reason = "'; DROP TABLE service_availability; --"

// Expected: Input sanitized, no SQL execution
```

#### 4. XSS Attack
```javascript
// Try injecting script in reason field
reason = "<script>alert('XSS')</script>"

// Expected: Script escaped/sanitized in display
```

#### 5. CSRF Attack
```bash
# Try making state-changing request from external site
curl -X POST https://admin.thelokals.com/api/toggle-service \
  -H "Cookie: session=stolen_cookie"

# Expected: CSRF token validation fails
```

---

## Security Checklist Summary

### Critical (Must Fix Before Production)
- [ ] Enable 2FA for super_admin accounts
- [ ] Implement API rate limiting
- [ ] Add input validation and sanitization
- [ ] Test all RLS policies thoroughly
- [ ] Verify HTTPS enforcement

### High Priority (Fix Within 1 Week)
- [ ] Add IP whitelisting for admin panel
- [ ] Implement session timeout (1 hour)
- [ ] Set up automated security scanning
- [ ] Document disaster recovery procedures
- [ ] Add CSRF protection

### Medium Priority (Fix Within 1 Month)
- [ ] Add WAF and DDoS protection
- [ ] Implement connection limits for WebSockets
- [ ] Set up audit log retention policy
- [ ] Add data export/deletion for GDPR
- [ ] Create security incident response plan

### Low Priority (Nice to Have)
- [ ] Add security headers (CSP, HSTS, etc.)
- [ ] Implement anomaly detection
- [ ] Add security awareness training for admins
- [ ] Set up bug bounty program
- [ ] Regular penetration testing

---

## Monitoring & Alerts

### Recommended Alerts
1. **Failed Login Attempts**: Alert after 5 failed attempts in 5 minutes
2. **Bulk Service Toggles**: Alert when >10 services toggled at once
3. **Unusual Activity**: Alert on admin actions outside business hours
4. **Database Errors**: Alert on any database errors in admin operations
5. **Session Anomalies**: Alert on multiple concurrent sessions for same admin

### Monitoring Dashboard
- Active admin sessions count
- Failed authentication attempts (last 24h)
- Service availability changes (last 7 days)
- Audit log entries per admin (last 30 days)
- WebSocket connection count

---

## Next Steps

1. **Immediate**: Run through manual security tests
2. **This Week**: Implement critical security fixes
3. **This Month**: Complete high-priority items
4. **Ongoing**: Regular security audits and penetration testing
