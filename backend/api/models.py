from django.db import models

# Create your models here.
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