from django.db import transaction
from rest_framework import generics, status
from restaurant.models import Order, OrderDetail, Product, Reservation
from restaurant.serializer import OrderSerializer, ReservationSerializer
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Avg
from rest_framework.response import Response
from rest_framework.views import APIView

## Đơn hàng
class CreateOrderView(generics.CreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Đặt user là người đang đăng nhập
        serializer.save(user=self.request.user)

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
        # Tổng số đơn hàng
        total_orders = Order.objects.filter(user=request.user).count()

        # Tổng doanh thu
        total_revenue = Order.objects.filter(user=request.user).aggregate(Sum('total_amount'))['total_amount__sum'] or 0

        # Tổng số sản phẩm đã bán
        total_products_sold = OrderDetail.objects.filter(order__user=request.user).aggregate(Sum('quantity'))['quantity__sum'] or 0

        # Giá trị đơn hàng trung bình
        average_order_value = Order.objects.filter(user=request.user).aggregate(Avg('total_amount'))['total_amount__avg'] or 0

        # Trả về dữ liệu thống kê
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
        # Thống kê doanh thu theo từng sản phẩm
        products_stats = Product.objects.annotate(
            total_quantity_sold=Sum('orderdetail__quantity'),
            total_revenue=Sum('orderdetail__unit_price')
        ).values('name', 'total_quantity_sold', 'total_revenue')

        return Response(products_stats)

## DS đơn hàng
class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Lấy danh sách đơn hàng của người dùng đã đăng nhập
        return Order.objects.filter(user=self.request.user)

##Chi tiết đơn hàng
class OrderDetailView(generics.RetrieveAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Chỉ cho phép truy cập các đơn hàng của chính người dùng
        return Order.objects.filter(user=self.request.user)

##Tạo đơn hàng
class OrderCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        order_details_data = data.pop('order_details', [])

        # Kiểm tra và tạo đơn hàng mới
        try:
            with transaction.atomic():
                order = Order.objects.create(user=request.user, **data)
                for detail in order_details_data:
                    product = Product.objects.get(id=detail['product'])
                    OrderDetail.objects.create(order=order, product=product, quantity=detail['quantity'], unit_price=product.price)

                order_serializer = OrderSerializer(order)
                return Response(order_serializer.data, status=status.HTTP_201_CREATED)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

## Cập nhật đơn
class OrderUpdateView(generics.UpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        order = self.get_object()
        if order.user != request.user:
            return Response({"error": "You do not have permission to edit this order."}, status=status.HTTP_403_FORBIDDEN)

        return super().patch(request, *args, **kwargs)

## Xoá đơn
class OrderDeleteView(generics.DestroyAPIView):
    queryset = Order.objects.all()
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        order = self.get_object()
        if order.user != request.user:
            return Response({"error": "You do not have permission to delete this order."},
                            status=status.HTTP_403_FORBIDDEN)

        order.delete()
        return Response({"message": "Order deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

## Đặt bàn
class ReservationCreateView(generics.CreateAPIView):
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

## Danh sách bàn
class ReservationListView(generics.ListAPIView):
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Reservation.objects.filter(user=self.request.user)

## Chi tiết bàn
class ReservationDetailView(generics.RetrieveAPIView):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Reservation.objects.filter(user=self.request.user)

## Cập nhật bàn
class ReservationUpdateView(generics.UpdateAPIView):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Reservation.objects.filter(user=self.request.user)

## Xoá bàn
class ReservationDeleteView(generics.DestroyAPIView):
    queryset = Reservation.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Reservation.objects.filter(user=self.request.user)

