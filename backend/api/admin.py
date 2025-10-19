from django.contrib import admin
from .models import Property, Photographer, Customer, Service, AddonService, PropertyService, Order
# Register your models here.
from django.contrib.auth.admin import UserAdmin
from .models import User  # your custom user model


admin.site.register(Property)  
admin.site.register(Photographer)   
admin.site.register(Customer) 
admin.site.register(Service)    
admin.site.register(AddonService)   
admin.site.register(PropertyService)
admin.site.register(Order)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ('username', 'email', 'role', 'company', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'phone', 'company', 'avatar', 'bio')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Role & status', {'fields': ('role',)}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'role', 'is_staff', 'is_active'),
        }),
    )

    search_fields = ('username', 'email', 'company')
    ordering = ('username',)
# admin.site.register(Order)    
# admin.site.register(OrderItem)    