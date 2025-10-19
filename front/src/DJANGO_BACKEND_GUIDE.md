# Django Backend Integration Guide

This guide provides everything you need to set up a Django REST API backend for the Real Estate Media app.

## Quick Start

### 1. Configuration

In `/lib/apiConfig.ts`, update:
```typescript
export const API_CONFIG = {
  USE_MOCK_DATA: false,  // Set to false to use real API
  API_BASE_URL: 'http://localhost:8000/api',  // Your Django backend URL
  // ... rest of config
};
```

### 2. Environment Variables

Create a `.env` file in your React app root:
```bash
REACT_APP_API_URL=http://localhost:8000/api
```

---

## Django Models

### models.py

```python
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    """Custom User model for brokers, photographers, and admins"""
    ROLE_CHOICES = [
        ('broker', 'Broker'),
        ('photographer', 'Photographer'),
        ('admin', 'Admin'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='broker')
    company = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'users'

class Photographer(models.Model):
    """Extended profile for photographers"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='photographer_profile')
    bio = models.TextField()
    specialties = models.JSONField(default=list)  # Array of strings
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    completed_jobs = models.IntegerField(default=0)
    available_dates = models.JSONField(default=list)  # Array of ISO date strings
    travel_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    class Meta:
        db_table = 'photographers'

class Customer(models.Model):
    """Client/Customer model"""
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    company = models.CharField(max_length=255, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'customers'

class Property(models.Model):
    """Real estate property model"""
    PROPERTY_TYPE_CHOICES = [
        ('house', 'House'),
        ('condo', 'Condo'),
        ('apartment', 'Apartment'),
        ('commercial', 'Commercial'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('scheduled', 'Scheduled'),
        ('in-progress', 'In Progress'),
        ('completed', 'Completed'),
    ]
    
    TEMPLATE_CHOICES = [
        ('modern', 'Modern'),
        ('luxury', 'Luxury'),
        ('classic', 'Classic'),
    ]
    
    address = models.CharField(max_length=500)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50)
    zip_code = models.CharField(max_length=10)
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPE_CHOICES)
    square_feet = models.IntegerField(blank=True, null=True)
    bedrooms = models.IntegerField(blank=True, null=True)
    bathrooms = models.DecimalField(max_digits=4, decimal_places=1, blank=True, null=True)
    year_built = models.IntegerField(blank=True, null=True)
    lot_size = models.IntegerField(blank=True, null=True)
    price = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    features = models.JSONField(default=list, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    landing_page_template = models.CharField(max_length=20, choices=TEMPLATE_CHOICES, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='properties')
    
    class Meta:
        db_table = 'properties'
        verbose_name_plural = 'Properties'

class Service(models.Model):
    """Available services (Photography, Video, etc.)"""
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    icon = models.CharField(max_length=50)  # Lucide icon name
    
    class Meta:
        db_table = 'services'

class AddonService(models.Model):
    """Addon services (Virtual Staging, Floor Plan, etc.)"""
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    applicable_services = models.JSONField(default=list)  # Array of service IDs
    
    class Meta:
        db_table = 'addon_services'

class PropertyService(models.Model):
    """Services assigned to a property"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
    ]
    
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='services')
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    photographer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    scheduled_date = models.DateField(blank=True, null=True)
    scheduled_time = models.CharField(max_length=20, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True, null=True)
    addon_ids = models.JSONField(default=list, blank=True, null=True)  # Array of addon service IDs
    
    class Meta:
        db_table = 'property_services'

class Order(models.Model):
    """Order/Invoice model"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('completed', 'Completed'),
    ]
    
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='orders')
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    travel_fees = models.JSONField(default=list)  # Array of {photographerId, fee}
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(default=timezone.now)
    due_date = models.DateField(blank=True, null=True)
    
    class Meta:
        db_table = 'orders'

class OrderService(models.Model):
    """Many-to-many relationship between orders and services"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_services')
    property_service = models.ForeignKey(PropertyService, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'order_services'

class Media(models.Model):
    """Uploaded media files"""
    TYPE_CHOICES = [
        ('photo', 'Photo'),
        ('video', 'Video'),
        ('3d-scan', '3D Scan'),
    ]
    
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='media')
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    file = models.FileField(upload_to='property_media/')
    thumbnail = models.ImageField(upload_to='thumbnails/', blank=True, null=True)
    file_name = models.CharField(max_length=255)
    file_size = models.BigIntegerField()  # Size in bytes
    uploaded_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'media'
        verbose_name_plural = 'Media'

class Job(models.Model):
    """Photographer job model"""
    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('in-progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    property_address = models.CharField(max_length=500)
    property_city = models.CharField(max_length=100)
    property_state = models.CharField(max_length=50)
    service_type = models.CharField(max_length=100)
    scheduled_date = models.DateField()
    scheduled_time = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    client_name = models.CharField(max_length=255)
    client_email = models.EmailField()
    client_phone = models.CharField(max_length=20, blank=True, null=True)
    service_price = models.DecimalField(max_digits=10, decimal_places=2)
    addons = models.JSONField(default=list)  # Array of {name, price}
    notes = models.TextField(blank=True, null=True)
    photographer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='jobs')
    delivered_at = models.DateTimeField(blank=True, null=True)
    uploaded_files = models.JSONField(default=list, blank=True, null=True)
    
    class Meta:
        db_table = 'jobs'

class Payment(models.Model):
    """Photographer payment model"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('paid', 'Paid'),
    ]
    
    photographer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    travel_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    date = models.DateField(blank=True, null=True)
    
    class Meta:
        db_table = 'payments'

class Template(models.Model):
    """Social media template model"""
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    thumbnail = models.ImageField(upload_to='template_thumbnails/')
    width = models.IntegerField()
    height = models.IntegerField()
    elements = models.JSONField(default=list)
    
    class Meta:
        db_table = 'templates'
```

---

## Django Serializers

### serializers.py

```python
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import *

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 
                  'role', 'company', 'phone', 'avatar', 'date_joined']
        read_only_fields = ['id', 'date_joined']

class PhotographerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Photographer
        fields = '__all__'

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = '__all__'

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

class AddonServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AddonService
        fields = '__all__'

class PropertyServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyService
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    services = PropertyServiceSerializer(many=True, read_only=True, source='order_services')
    
    class Meta:
        model = Order
        fields = '__all__'

class MediaSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    
    def get_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None
    
    def get_thumbnail_url(self, obj):
        request = self.context.get('request')
        if obj.thumbnail and request:
            return request.build_absolute_uri(obj.thumbnail.url)
        return None
    
    class Meta:
        model = Media
        fields = '__all__'

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
```

---

## Django Views

### views.py

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import *
from .serializers import *

class AuthViewSet(viewsets.ViewSet):
    """Authentication endpoints"""
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        user = authenticate(username=email, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            })
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
    @action(detail=False, methods=['post'])
    def signup(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        name = request.data.get('name')
        role = request.data.get('role', 'broker')
        
        if User.objects.filter(email=email).exists():
            return Response({'detail': 'User already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=name.split()[0] if name else '',
            last_name=' '.join(name.split()[1:]) if name and len(name.split()) > 1 else '',
            role=role,
            company=request.data.get('company'),
            phone=request.data.get('phone'),
        )
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        return Response(UserSerializer(request.user).data)

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['get'])
    def services(self, request, pk=None):
        property_obj = self.get_object()
        services = PropertyService.objects.filter(property=property_obj)
        serializer = PropertyServiceSerializer(services, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def media(self, request, pk=None):
        property_obj = self.get_object()
        media = Media.objects.filter(property=property_obj)
        serializer = MediaSerializer(media, many=True, context={'request': request})
        return Response(serializer.data)

class ServiceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def addons(self, request):
        addons = AddonService.objects.all()
        serializer = AddonServiceSerializer(addons, many=True)
        return Response(serializer.data)

class PropertyServiceViewSet(viewsets.ModelViewSet):
    queryset = PropertyService.objects.all()
    serializer_class = PropertyServiceSerializer
    permission_classes = [IsAuthenticated]

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]

class PhotographerViewSet(viewsets.ModelViewSet):
    queryset = Photographer.objects.all()
    serializer_class = PhotographerSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def jobs(self, request):
        jobs = Job.objects.filter(photographer=request.user)
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def payments(self, request):
        payments = Payment.objects.filter(photographer=request.user)
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['post'])
    def upload(self, request, pk=None):
        job = self.get_object()
        uploaded_file = request.FILES.get('file')
        
        if not uploaded_file:
            return Response({'detail': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Handle file upload logic here
        # Save to Media model, update job status, etc.
        
        return Response({'detail': 'File uploaded successfully'}, status=status.HTTP_201_CREATED)

class MediaViewSet(viewsets.ModelViewSet):
    queryset = Media.objects.all()
    serializer_class = MediaSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def upload(self, request):
        property_id = request.data.get('propertyId')
        service_id = request.data.get('serviceId')
        media_type = request.data.get('type')
        uploaded_file = request.FILES.get('file')
        
        if not all([property_id, service_id, media_type, uploaded_file]):
            return Response({'detail': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
        
        media = Media.objects.create(
            property_id=property_id,
            service_id=service_id,
            type=media_type,
            file=uploaded_file,
            file_name=uploaded_file.name,
            file_size=uploaded_file.size,
        )
        
        serializer = MediaSerializer(media, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
```

---

## Django URLs

### urls.py

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import *

router = DefaultRouter()
router.register(r'properties', PropertyViewSet)
router.register(r'services', ServiceViewSet)
router.register(r'property-services', PropertyServiceViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'photographers', PhotographerViewSet)
router.register(r'jobs', JobViewSet)
router.register(r'media', MediaViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/auth/login/', AuthViewSet.as_view({'post': 'login'})),
    path('api/auth/signup/', AuthViewSet.as_view({'post': 'signup'})),
    path('api/auth/logout/', AuthViewSet.as_view({'post': 'logout'})),
    path('api/auth/me/', AuthViewSet.as_view({'get': 'me'})),
    path('api/auth/refresh/', TokenRefreshView.as_view()),
]
```

---

## Django Settings

### settings.py additions

```python
INSTALLED_APPS = [
    # ... other apps
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'your_app',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ... other middleware
]

# CORS Settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True

# REST Framework Settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# JWT Settings
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# Custom User Model
AUTH_USER_MODEL = 'your_app.User'

# Media Files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

---

## Installation

### Required packages:

```bash
pip install django
pip install djangorestframework
pip install djangorestframework-simplejwt
pip install django-cors-headers
pip install pillow  # For image handling
```

---

## Initial Setup Commands

```bash
# Create migrations
python manage.py makemigrations

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

---

## Testing the API

Use these curl commands to test:

```bash
# Signup
curl -X POST http://localhost:8000/api/auth/signup/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User","role":"broker"}'

# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Get properties (with auth token)
curl -X GET http://localhost:8000/api/properties/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Frontend Integration Checklist

- [ ] Set `USE_MOCK_DATA: false` in `/lib/apiConfig.ts`
- [ ] Update `API_BASE_URL` to your Django backend URL
- [ ] Set up environment variables (`.env` file)
- [ ] Test authentication flow
- [ ] Test CRUD operations for properties
- [ ] Test file uploads
- [ ] Verify CORS settings
- [ ] Handle API errors gracefully
- [ ] Add loading states to UI

---

## Notes

1. **Authentication**: The app uses JWT (JSON Web Tokens) for authentication
2. **File Uploads**: Media files are handled via multipart/form-data
3. **Date Formats**: Dates should be in ISO 8601 format (YYYY-MM-DD)
4. **JSON Fields**: Arrays and objects are stored as JSON in the database
5. **Error Handling**: All API errors return `{detail: "error message"}`

For production deployment, make sure to:
- Set `DEBUG = False`
- Configure proper database (PostgreSQL recommended)
- Set up static/media file serving (S3, CloudFront, etc.)
- Use environment variables for secrets
- Enable HTTPS
- Set up proper logging
