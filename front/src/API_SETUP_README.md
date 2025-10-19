# API Setup - Quick Start Guide

This app is now ready for Django backend integration with a **plug-and-play API layer**.

## 🚀 Quick Start (2 Minutes)

### Step 1: Toggle API Mode

In `/lib/apiConfig.ts`, change:
```typescript
USE_MOCK_DATA: false  // Switch from true to false
```

### Step 2: Set API URL

Update the API base URL:
```typescript
API_BASE_URL: 'http://localhost:8000/api'  // Your Django backend
```

### Step 3: Run Django Backend

```bash
cd backend
python manage.py runserver
```

That's it! The app will now use your Django API instead of mock data.

---

## 📁 Files Created

### API Layer
- `/lib/apiConfig.ts` - Configuration and feature flags
- `/lib/api.ts` - Complete API client with all endpoints
- `/contexts/AuthContext.tsx` - Updated to use API
- `/contexts/AppContext.tsx` - Updated to use API

### Documentation
- `/DJANGO_BACKEND_GUIDE.md` - Complete Django setup guide
- `/API_REFERENCE.md` - API endpoint documentation
- `/DEPLOYMENT_CHECKLIST.md` - Production deployment guide
- `/API_SETUP_README.md` - This file

---

## 🎯 How It Works

### Dual Mode System

The app works in **two modes**:

1. **Mock Mode** (`USE_MOCK_DATA: true`)
   - Uses localStorage for data persistence
   - No backend required
   - Perfect for development and demos

2. **API Mode** (`USE_MOCK_DATA: false`)
   - Makes real HTTP requests to Django
   - Full authentication with JWT
   - Production-ready

### Seamless Switching

All data operations automatically switch between modes:

```typescript
// In api.ts
async getAll(): Promise<Property[]> {
  if (API_CONFIG.USE_MOCK_DATA) {
    // Return from localStorage
    return getFromLocalStorage('properties', []);
  }
  // Make HTTP request to Django
  return apiClient.get('/properties/');
}
```

---

## 🔐 Authentication Flow

### Login Process

1. User enters credentials
2. `authApi.login()` is called
3. **Mock Mode**: Returns fake token and user
4. **API Mode**: Calls `POST /api/auth/login/`
5. Token stored in localStorage
6. User state updated

### Token Handling

- Access token: Short-lived (1 hour)
- Refresh token: Long-lived (7 days)
- Auto-refresh on expiration
- Automatic logout on 401 errors

---

## 📡 API Endpoints

All endpoints are defined in `/lib/apiConfig.ts`:

### Authentication
- `POST /auth/login/`
- `POST /auth/signup/`
- `POST /auth/logout/`
- `GET /auth/me/`
- `POST /auth/refresh/`

### Resources
- Properties: `/properties/`
- Services: `/services/`
- Orders: `/orders/`
- Customers: `/customers/`
- Photographers: `/photographers/`
- Jobs: `/jobs/`
- Media: `/media/`

See `/API_REFERENCE.md` for complete documentation.

---

## 🛠️ Development Workflow

### Working with Mock Data

```typescript
// Keep using mock data during development
USE_MOCK_DATA: true
```

Benefits:
- No backend setup needed
- Fast development
- Works offline
- Easy testing

### Switching to API

```typescript
// Ready to test with real backend
USE_MOCK_DATA: false
```

Requirements:
- Django backend running
- CORS configured
- Database migrated

---

## 🔄 Data Flow

### Example: Creating a Property

**Frontend:**
```typescript
// In AppContext
await addProperty(newProperty)
```

**API Layer:**
```typescript
// In api.ts
async create(property: Property): Promise<Property> {
  if (API_CONFIG.USE_MOCK_DATA) {
    // Save to localStorage
    const properties = getFromLocalStorage('properties', []);
    properties.push(property);
    saveToLocalStorage('properties', properties);
    return property;
  }
  // Call Django API
  return apiClient.post('/properties/', property);
}
```

**Backend:**
```python
# Django view
@api_view(['POST'])
def create_property(request):
    serializer = PropertySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(owner=request.user)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)
```

---

## 🎨 Context Updates

### AuthContext

Now uses `authApi` for all operations:
- ✅ Login with real authentication
- ✅ Signup with validation
- ✅ Logout with token blacklisting
- ✅ Auto-restore session on refresh

### AppContext

Now uses API for all CRUD operations:
- ✅ Async data loading on mount
- ✅ Error handling
- ✅ Optimistic updates
- ✅ Loading states

---

## 🐛 Error Handling

### API Errors

All API errors are caught and logged:

```typescript
try {
  await propertiesApi.create(property);
} catch (error) {
  console.error('Failed to create property:', error);
  // Show user-friendly error
  toast.error('Failed to create property');
}
```

### Common Issues

**CORS Error:**
```
Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```
**Solution:** Add to Django settings:
```python
CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
```

**401 Unauthorized:**
```
Authentication credentials were not provided.
```
**Solution:** Check token in localStorage and Authorization header.

---

## 📦 File Upload

### Example: Upload Media

```typescript
// Frontend
const file = event.target.files[0];
await mediaApi.upload(propertyId, serviceId, file, 'photo');
```

### API Implementation

```typescript
// api.ts
async upload(propertyId, serviceId, file, type) {
  if (API_CONFIG.USE_MOCK_DATA) {
    // Mock upload - create object URL
    return { url: URL.createObjectURL(file) };
  }
  // Real upload - multipart/form-data
  return apiClient.uploadFile('/media/upload/', file, {
    propertyId,
    serviceId,
    type
  });
}
```

---

## 🔍 Testing

### Test Mock Mode

```bash
# In apiConfig.ts: USE_MOCK_DATA: true
npm start
# Test all features
```

### Test API Mode

```bash
# Start Django backend
cd backend
python manage.py runserver

# In apiConfig.ts: USE_MOCK_DATA: false
npm start
# Test with real API
```

### Integration Tests

```bash
# Run both servers
npm run test:integration
```

---

## 🚢 Production Setup

### 1. Environment Variables

Create `.env`:
```bash
REACT_APP_API_URL=https://api.your-domain.com/api
```

### 2. Build Configuration

```typescript
// apiConfig.ts
API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api'
```

### 3. Deploy

```bash
npm run build
# Deploy build folder to hosting
```

See `/DEPLOYMENT_CHECKLIST.md` for complete guide.

---

## 📚 Additional Resources

- **Django Setup**: See `/DJANGO_BACKEND_GUIDE.md`
- **API Documentation**: See `/API_REFERENCE.md`
- **Deployment**: See `/DEPLOYMENT_CHECKLIST.md`

---

## 🤝 Support

### Common Commands

```bash
# Switch to mock mode
USE_MOCK_DATA: true

# Switch to API mode
USE_MOCK_DATA: false

# Clear localStorage
localStorage.clear()

# Check current user
localStorage.getItem('user')

# Check access token
localStorage.getItem('access_token')
```

### Debug Checklist

- [ ] Backend is running
- [ ] USE_MOCK_DATA is set correctly
- [ ] API_BASE_URL is correct
- [ ] CORS is configured
- [ ] Tokens are valid
- [ ] Network tab shows requests

---

## ✨ Features

### ✅ Implemented

- Complete authentication system
- CRUD for all resources
- File upload support
- Token refresh
- Error handling
- Loading states
- Offline support (mock mode)

### 🎯 Best Practices

- Type-safe API calls
- Error boundaries
- Token auto-refresh
- Graceful degradation
- Optimistic updates
- Request cancellation
- Timeout handling

---

## 🎉 You're Ready!

The app is now fully configured for Django backend integration. Just:

1. Set `USE_MOCK_DATA: false`
2. Start your Django backend
3. Everything works automatically!

No code changes needed in components - they already use the API layer through contexts.
