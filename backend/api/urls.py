from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import *

router = DefaultRouter()
router.register(r'orders', OrderViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'photographers', PhotographerViewSet)
router.register(r'jobs', JobViewSet)
router.register(r'properties', PropertyViewSet, basename='property')
router.register(r'services', PropertyServiceViewSet, basename='service')
router.register(r'property-services', PropertyServiceViewSet, basename='propertyservice')
router.register(r'media', MediaViewSet, basename='media')

urlpatterns = [
    path('', include(router.urls)),  # ✅ FIXED (no slash at start)
    
    # Auth endpoints
    path('auth/login/', AuthViewSet.as_view({'post': 'login'})),
    path('auth/signup/', AuthViewSet.as_view({'post': 'signup'})),
    path('auth/logout/', AuthViewSet.as_view({'post': 'logout'})),
    path('auth/me/', AuthViewSet.as_view({'get': 'me'})),
    path('auth/refresh/', TokenRefreshView.as_view()),
]