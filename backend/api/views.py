from django.shortcuts import render

# Create your views here.
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