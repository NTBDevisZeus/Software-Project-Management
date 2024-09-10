from django.db import transaction
from restaurant.models import *
from rest_framework.parsers import MultiPartParser, JSONParser
from restaurant.serializers import OrderSerializer, ReservationSerializer, PaymentSerializer, ProductSerializer, \
    UserSerializer, CategorySerializer, OrderDetailSerializer
from rest_framework.permissions import IsAuthenticated

from rest_framework.response import Response

from rest_framework import viewsets, generics, permissions
from rest_framework.decorators import action

class CategoryViewSet(viewsets.ModelViewSet, generics.CreateAPIView):
    queryset =  Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ['update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

class UserOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


####### Update Order + OrderDetail
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        order = serializer.save()
        order.update_status()  # Update status to 1 when the order is created

# class OrderViewSet(viewsets.ModelViewSet):
#     queryset = Order.objects.all()
#     serializer_class = OrderSerializer
#     permission_classes = [permissions.IsAuthenticated]
#
#     def create(self, request, *args, **kwargs):
#         data = request.data.copy()
#         order_details_data = data.pop('order_details', [])
#
#         serializer = self.get_serializer(data=data)
#         serializer.is_valid(raise_exception=True)
#         order = serializer.save()
#
#         total_amount = 0
#         for detail_data in order_details_data:
#             product = detail_data.get('product')
#             quantity = detail_data.get('quantity')
#             unit_price = detail_data.get('unit_price')
#
#             OrderDetail.objects.create(
#                 order=order,
#                 product=product,
#                 quantity=quantity,
#                 unit_price=unit_price
#             )
#             total_amount += quantity * unit_price
#
#         order.total_amount = total_amount
#         order.save()
#
#         headers = self.get_success_headers(serializer.data)
#         return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class OrderDetailViewSet(viewsets.ModelViewSet):
    queryset = OrderDetail.objects.all()
    serializer_class = OrderDetailSerializer
    permission_classes = [IsAuthenticated]

class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically set the user field to the currently authenticated user
        serializer.save(user=self.request.user)

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.action in ['update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    parser_classes = [MultiPartParser, JSONParser]

    def get_permissions(self):
        if self.action in ['current_user', 'change_password']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    @action(methods=['get', 'patch'], url_path='current-user', detail=False)
    def current_user(self, request):
        user = request.user
        if request.method == 'PATCH':
            for k, v in request.data.items():
                setattr(user, k, v)
            user.save()
        return Response(UserSerializer(request.user).data)

