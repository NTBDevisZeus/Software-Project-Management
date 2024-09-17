from django.db import transaction
from restaurant.models import *
from rest_framework.parsers import MultiPartParser, JSONParser
from restaurant.serializers import OrderSerializer, ReservationSerializer, PaymentSerializer, ProductSerializer, \
    UserSerializer, CategorySerializer, OrderDetailSerializer, FeedbackSerializer, TableSerializer
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from rest_framework.response import Response

from rest_framework import viewsets, generics, permissions,status
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

    @action(detail=False, methods=['get'], url_path='cate/(?P<category_id>[^/.]+)')
    def products_by_category(self, request, category_id=None):
        # Lọc danh sách sản phẩm theo category_id
        products = Product.objects.filter(category__id=category_id)
        if not products.exists():
            return Response({"detail": "No products found for this category."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    # Tìm kiếm theo tên sản phẩm (case-insensitive)
    def get_queryset(self):
        queryset = super().get_queryset()
        search_query = self.request.query_params.get('q', None)
        if search_query:
            queryset = queryset.filter(Q(name__icontains=search_query))

        return queryset

class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.all()
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

class TableViewSet (viewsets.ModelViewSet):
    queryset = Table.objects.all()
    serializer_class = TableSerializer
    # permission_classes = [IsAuthenticated]


class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Tự động thiết lập trường user bằng người dùng hiện tại
        serializer.save(user=self.request.user)

    # Tùy chọn: Thêm hành động riêng nếu cần
    @action(detail=False, methods=['get'])
    def my_feedbacks(self, request):
        feedbacks = Feedback.objects.all()
        serializer = self.get_serializer(feedbacks, many=True)
        return Response(serializer.data)


