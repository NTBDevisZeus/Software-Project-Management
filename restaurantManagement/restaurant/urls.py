from django.urls import path, include
from rest_framework import routers
from restaurant.views import CreateOrderView, StatisticsView, StatisticsByProductView, \
    OrderDetailView, UserOrderListView, ReservationViewSet, PaymentViewSet, ProductViewSet, UserViewSet

router = routers.DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'reservations', ReservationViewSet, basename='reservation')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    # Các URL do router cung cấp
    path('', include(router.urls)),

    # Các URL tùy chỉnh
    path('orders/create/', CreateOrderView.as_view(), name='create-order'),
    path('orders/user/', UserOrderListView.as_view(), name='user-order-list'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('statistics/', StatisticsView.as_view(), name='statistics'),
    path('statistics/products/', StatisticsByProductView.as_view(), name='statistics-by-product'),
]
