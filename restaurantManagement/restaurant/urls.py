from django.urls import path, include
from rest_framework import routers
from restaurant.views import UserOrderListView, ReservationViewSet, PaymentViewSet, ProductViewSet, UserViewSet, \
    CategoryViewSet, OrderViewSet

router = routers.DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'reservations', ReservationViewSet, basename='reservation')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'category',CategoryViewSet, basename='category')
urlpatterns = [
    # Các URL do router cung cấp
    path('', include(router.urls)),

    # Các URL tùy chỉnh

    path('orders/user/', UserOrderListView.as_view(), name='user-order-list'),
]