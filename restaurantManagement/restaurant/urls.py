from django.urls import path, include
from rest_framework import routers

from restaurant.admin import admin_site
from restaurant.views import UserOrderListView, ReservationViewSet, PaymentViewSet, ProductViewSet, UserViewSet, \
    CategoryViewSet, OrderViewSet, TableViewSet, FeedbackViewSet, pay, CreateOrderView, handle_payments, save_cart, \
    momo_success, create_vnpay_url, vnpay_return

router = routers.DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'reservations', ReservationViewSet, basename='reservation')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'category',CategoryViewSet, basename='category')
router.register(r'tables', TableViewSet,basename='table')
router.register(r'feedbacks', FeedbackViewSet, basename='feedback')
router.register(r'payment', PaymentViewSet, basename='payment')


urlpatterns = [
    # Các URL do router cung cấp
    path('', include(router.urls)),
    path('pay/', pay, name='pay'),
    path('payment/momo-payment/', PaymentViewSet.as_view({'post': 'momo_payment'}), name='momo-payment'),
    path('payment/momo-notify/', PaymentViewSet.as_view({'post': 'momo_notify'}), name='momo-notify'),
    path('orders/user/', UserOrderListView.as_view(), name='user-order-list'),
    path('admin/', admin_site.urls),
    path('api/create-order/', CreateOrderView.as_view(), name='create-order'),
    path('payUrl', handle_payments, name='handle_payments'),
    path('save-cart/', save_cart, name='save_cart'),  # Đường dẫn để lưu giỏ hàng
    path('api/momo-success/', momo_success, name='momo_success'),
    path('vnpay/', create_vnpay_url, name='vnpay_payment'),
    path('vnpay_return/', vnpay_return, name='vnpay_return'),
]


