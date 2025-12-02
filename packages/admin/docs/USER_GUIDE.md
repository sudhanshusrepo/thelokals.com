# Admin Panel - User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Live Users Monitoring](#live-users-monitoring)
4. [Live Jobs Monitoring](#live-jobs-monitoring)
5. [Service Control](#service-control)
6. [Audit Logs](#audit-logs)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Accessing the Admin Panel

1. Navigate to `https://admin.thelokals.com`
2. Sign in using one of two methods:
   - **Google OAuth**: Click "Sign in with Google"
   - **Email/Password**: Enter your admin credentials

### User Roles

The admin panel has three role levels:

| Role | Permissions |
|------|-------------|
| **Super Admin** | Full access to all features, can manage other admins |
| **Ops Admin** | Can view all data and control service availability |
| **Read Only** | Can view dashboards and logs, no modification access |

---

## Dashboard Overview

The main dashboard provides a quick overview of platform activity:

- **Active Users**: Real-time count of customers and providers online
- **Active Jobs**: Current bookings in progress
- **Recent Activity**: Latest system events
- **Quick Actions**: Shortcuts to common tasks

### Navigation

Use the sidebar to navigate between sections:
- 📊 **Dashboard**: Overview and quick stats
- 👥 **Live Users**: Real-time user monitoring
- 🔧 **Live Jobs**: Active booking monitoring
- ⚙️ **Service Control**: Enable/disable services by location
- 📍 **Locations**: Manage service areas
- 📈 **Analytics**: Platform metrics and insights
- 📝 **Audit Logs**: Action history and compliance

---

## Live Users Monitoring

### Overview

The Live Users page shows all active users (sessions in last 5 minutes) with real-time updates via WebSocket.

### Features

**Summary Cards**
- Active Customers count
- Active Providers count
- Total Active users

**Filters**
- Filter by city
- Filter by user type (customer/provider)

**User Table**
- User ID (truncated)
- User type badge
- Current city
- Session state
- Last activity timestamp

### Real-Time Updates

The page automatically updates when:
- New users come online
- Users go offline (5 min timeout)
- User location changes
- Session state changes

### Use Cases

1. **Monitor Platform Health**: Check if users are active
2. **Regional Analysis**: See which cities have most activity
3. **Support**: Identify users who may need assistance
4. **Capacity Planning**: Track peak usage times

---

## Live Jobs Monitoring

### Overview

The Live Jobs page displays all active bookings with real-time status updates.

### Features

**Summary Cards**
- Total Active jobs
- Pending bookings
- Confirmed bookings
- In Progress jobs

**Status Filters**
- All jobs
- Pending (awaiting provider acceptance)
- Confirmed (scheduled)
- In Progress (currently active)

**Jobs Table**
- Booking ID
- Service type (AI_ENHANCED, LIVE, SCHEDULED)
- Service category
- Status badge
- Creation timestamp
- Estimated cost

### Real-Time Updates

The page automatically updates when:
- New bookings are created
- Booking status changes
- Providers accept/reject bookings
- Jobs are completed

### Use Cases

1. **Operations Monitoring**: Track active service delivery
2. **Issue Detection**: Identify stuck or delayed bookings
3. **Provider Performance**: Monitor job acceptance rates
4. **Revenue Tracking**: View estimated costs in real-time

---

## Service Control

### Overview

The Service Control page allows authorized admins (Super Admin, Ops Admin) to enable or disable services on a location-wise basis.

### How to Use

#### 1. Select a City

Choose a city from the dropdown menu to manage services for that location.

#### 2. View Service Status

Services are displayed in two categories:
- **Local Services**: Physical, on-location services
- **Online Services**: Remote, digital services

Each service card shows:
- Service name
- Service type (local/online)
- Current status (ENABLED/DISABLED)
- Visual indicator (green = enabled, red = disabled)

#### 3. Toggle Individual Service

Click on a service card's status button to toggle it:
- **Disabling**: You'll be prompted for a reason (required)
- **Enabling**: Service is immediately enabled

#### 4. Bulk Actions

Use bulk action buttons to:
- Disable All Local Services
- Enable All Local Services
- Disable All Online Services
- Enable All Online Services

**Important**: Bulk actions also require a reason when disabling.

### Best Practices

1. **Always Provide Clear Reasons**: Help other admins understand why services were disabled
2. **Communicate Changes**: Notify the team before disabling services
3. **Monitor Impact**: Check Live Jobs after disabling to see affected bookings
4. **Re-enable Promptly**: Don't leave services disabled longer than necessary

### Example Use Cases

**Phased Rollout**
```
1. Launch new service in one city first
2. Keep it disabled in other cities
3. Monitor performance and feedback
4. Gradually enable in more cities
```

**Operational Issues**
```
1. Provider shortage in a city
2. Disable affected services temporarily
3. Add reason: "Provider shortage - recruiting"
4. Re-enable when providers available
```

**Maintenance Windows**
```
1. System maintenance scheduled
2. Disable online services during window
3. Add reason: "Scheduled maintenance 2-4 AM"
4. Re-enable after maintenance
```

### Impact on Users

When a service is disabled:
- **Client App**: Service hidden or marked "Unavailable in your area"
- **Booking Attempts**: Blocked with clear error message
- **Existing Jobs**: Not affected (continue normally)
- **Provider App**: Can't receive new jobs for that service

---

## Audit Logs

### Overview

The Audit Logs page provides a complete history of all admin actions for compliance and troubleshooting.

### Log Entries Include

- Admin user who performed action
- Action type (e.g., "toggle_service", "bulk_disable_services")
- Resource affected
- Changes made (before/after values)
- Timestamp
- IP address (if available)

### Filtering

- Filter by admin user
- Filter by action type
- Filter by date range
- Search by resource ID

### Use Cases

1. **Compliance Audits**: Track who did what and when
2. **Troubleshooting**: Identify when a service was disabled
3. **Security**: Detect unauthorized access attempts
4. **Training**: Review actions for training purposes

---

## Troubleshooting

### Common Issues

#### Can't Sign In

**Problem**: Google OAuth fails  
**Solution**: 
1. Check if you're using an authorized email
2. Clear browser cache and cookies
3. Try email/password login instead
4. Contact super admin to verify your account

#### Service Won't Toggle

**Problem**: Service status doesn't change  
**Solution**:
1. Verify you have ops_admin or super_admin role
2. Check if you provided a reason (required for disable)
3. Refresh the page and try again
4. Check audit logs for error messages

#### Real-Time Updates Not Working

**Problem**: Live Users/Jobs not updating  
**Solution**:
1. Check internet connection
2. Refresh the page to reconnect WebSocket
3. Check browser console for errors
4. Verify Supabase connection is active

#### Missing Data

**Problem**: No users/jobs showing  
**Solution**:
1. Check if filters are too restrictive
2. Verify there is actual activity on platform
3. Check if you have read permissions
4. Try refreshing the page

### Getting Help

1. **Check Audit Logs**: See if action was logged
2. **Browser Console**: Check for JavaScript errors (F12)
3. **Contact Support**: Email admin-support@thelokals.com
4. **Emergency**: Call ops team for critical issues

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt + D` | Go to Dashboard |
| `Alt + U` | Go to Live Users |
| `Alt + J` | Go to Live Jobs |
| `Alt + S` | Go to Service Control |
| `Alt + L` | Go to Audit Logs |
| `Ctrl + R` | Refresh current page |
| `Esc` | Close modal/dialog |

---

## Best Practices

### Security
- ✅ Always sign out when finished
- ✅ Never share your credentials
- ✅ Use strong, unique passwords
- ✅ Enable 2FA if available
- ❌ Don't access admin panel on public WiFi

### Operations
- ✅ Provide clear reasons for service changes
- ✅ Monitor impact after making changes
- ✅ Document major actions in team chat
- ✅ Review audit logs regularly
- ❌ Don't make bulk changes without planning

### Data Privacy
- ✅ Only access data you need
- ✅ Don't share user information externally
- ✅ Follow company data retention policies
- ❌ Don't export data without authorization

---

## Support

For questions or issues:
- **Email**: admin-support@thelokals.com
- **Slack**: #admin-panel-support
- **Emergency**: +91-XXXX-XXXXXX (24/7 ops team)

**Last Updated**: December 2, 2024  
**Version**: 1.0.0
