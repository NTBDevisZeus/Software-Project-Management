"""
URL configuration for restaurantManagement project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from restaurant.views import CreateOrderView, StatisticsView, StatisticsByProductView, OrderListView, OrderDeleteView, \
    OrderDetailView, OrderCreateView, OrderUpdateView, ReservationCreateView, ReservationListView, \
    ReservationDetailView, ReservationUpdateView, ReservationDeleteView, PaymentListCreateView, PaymentDetailView, \
    ProductListCreateView, ProductDetailView, UserProfileView

urlpatterns = [
    path('admin/', admin.site.urls),

    ## Đơn hàng
    path('orders/', CreateOrderView.as_view(), name='create_order'),

    ## Thống kê tổng
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

    #Xem thanh toán
    path('payments/<int:pk>/', PaymentDetailView.as_view(), name='payment-detail'),

    # Tạo sản phẩm
    path('products/', ProductListCreateView.as_view(), name='product-list-create'),

    # Xem sản phẩm
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),

    # Profile
    path('profile/', UserProfileView.as_view(), name='user-profile'),
]
