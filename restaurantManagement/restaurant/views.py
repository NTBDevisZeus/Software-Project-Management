
from django.db import transaction
from restaurant.models import *
from rest_framework.parsers import MultiPartParser, JSONParser
from restaurant.models import Order, OrderDetail, Product, Reservation, Payment,User
from restaurant.serializers import OrderSerializer, ReservationSerializer, PaymentSerializer, ProductSerializer, \
    UserSerializer
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Avg
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import viewsets, generics, status, parsers, permissions
from rest_framework.decorators import action





## Đơn hàng người dùng
class UserOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

## Chi tiết sản phẩm
class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

## Thống kê tổng
class StatisticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        total_orders = Order.objects.filter(user=request.user).count()
        total_revenue = Order.objects.filter(user=request.user).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        total_products_sold = OrderDetail.objects.filter(order__user=request.user).aggregate(Sum('quantity'))['quantity__sum'] or 0
        average_order_value = Order.objects.filter(user=request.user).aggregate(Avg('total_amount'))['total_amount__avg'] or 0

        data = {
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "total_products_sold": total_products_sold,
            "average_order_value": average_order_value
        }
        return Response(data)

## Thống kê sản phẩm
class StatisticsByProductView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        products_stats = Product.objects.annotate(
            total_quantity_sold=Sum('orderdetail__quantity'),
            total_revenue=Sum('orderdetail__unit_price')
        ).values('name', 'total_quantity_sold', 'total_revenue')
        return Response(products_stats)

## Đơn hàng ViewSet
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    @action(methods=['get'], detail=False, url_path='recent-orders')
    def recent_orders(self, request):
        recent_orders = self.get_queryset().filter(date__gte='2024-01-01')
        serializer = self.serializer_class(recent_orders, many=True)
        return Response(serializer.data)

    @action(methods=['post'], detail=False, url_path='create-order')
    def create_order(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Thực hiện lưu đơn hàng với thông tin user từ request
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

## Đặt bàn ViewSet
class ReservationViewSet(viewsets.ModelViewSet):
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Reservation.objects.filter(user=self.request.user)

    @action(methods=['get'], detail=False, url_path='recent-reservations')
    def recent_reservations(self, request):
        recent_reservations = self.get_queryset().filter(date__gte='2024-01-01')
        serializer = self.serializer_class(recent_reservations, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

## Thanh toán ViewSet
class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

## Quản lý hàng ViewSet
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
        if request.method.__eq__('PATCH'):
            for k, v in request.data.items():
                setattr(user, k, v)  # user.k = v
            user.save()
        return Response(UserSerializer(request.user).data)



