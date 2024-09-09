from django.contrib import admin
from django.urls import path, re_path, include
from restaurant.views import CreateOrderView, StatisticsView, StatisticsByProductView, OrderListView, OrderDeleteView, \
    OrderDetailView, OrderCreateView, OrderUpdateView, ReservationCreateView, ReservationListView, \
    ReservationDetailView, ReservationUpdateView, ReservationDeleteView, PaymentListCreateView, PaymentDetailView, \
    ProductListCreateView, ProductDetailView, UserViewSet

from rest_framework.routers import DefaultRouter
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Khởi tạo router cho UserViewSet
router = DefaultRouter()
router.register(r'profile', UserViewSet, basename='user-profile')

# Thiết lập Swagger
schema_view = get_schema_view(
    openapi.Info(
        title="Course API",
        default_version='v1',
        description="APIs for CourseApp",
        contact=openapi.Contact(email="thanh.dh@ou.edu.vn"),
        license=openapi.License(name="Dương Hữu Thành@2021"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Đơn hàng
    path('orders/', CreateOrderView.as_view(), name='create_order'),

    # Thống kê tổng
    path('statistics/', StatisticsView.as_view(), name='statistics'),

    # Thống kê sản phẩm
    path('statistics/products/', StatisticsByProductView.as_view(), name='statistics_by_product'),

    # Danh sách đơn hàng
    path('orders/', OrderListView.as_view(), name='order-list'),

    # Chi tiết đơn hàng
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),

    # Tạo đơn hàng
    path('orders/create/', OrderCreateView.as_view(), name='order-create'),

    # Cập nhật đơn hàng
    path('orders/update/<int:pk>/', OrderUpdateView.as_view(), name='order-update'),

    # Xóa đơn hàng
    path('orders/delete/<int:pk>/', OrderDeleteView.as_view(), name='order-delete'),

    # Tạo đặt bàn mới
    path('reservations/create/', ReservationCreateView.as_view(), name='reservation-create'),

    # Danh sách đặt bàn
    path('reservations/', ReservationListView.as_view(), name='reservation-list'),

    # Chi tiết đặt bàn
    path('reservations/<int:pk>/', ReservationDetailView.as_view(), name='reservation-detail'),

    # Cập nhật đặt bàn
    path('reservations/update/<int:pk>/', ReservationUpdateView.as_view(), name='reservation-update'),

    # Xóa đặt bàn
    path('reservations/delete/<int:pk>/', ReservationDeleteView.as_view(), name='reservation-delete'),

    # Tạo thanh toán
    path('payments/', PaymentListCreateView.as_view(), name='payment-list-create'),

    # Xem thanh toán
    path('payments/<int:pk>/', PaymentDetailView.as_view(), name='payment-detail'),

    # Tạo sản phẩm
    path('products/', ProductListCreateView.as_view(), name='product-list-create'),

    # Xem sản phẩm
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),

    # Thêm router URLs vào urlpatterns
    path('', include(router.urls)),

    # Swagger
    re_path(r'^swagger(?P<format>\.json|\.yaml)$',
            schema_view.without_ui(cache_timeout=0),
            name='schema-json'),
    re_path(r'^swagger/$',
            schema_view.with_ui('swagger', cache_timeout=0),
            name='schema-swagger-ui'),
    re_path(r'^redoc/$',
            schema_view.with_ui('redoc', cache_timeout=0),
            name='schema-redoc'),
]
