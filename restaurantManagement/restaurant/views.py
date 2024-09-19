import random

from rest_framework.views import APIView
import time
from restaurant.models import *
from rest_framework.parsers import MultiPartParser, JSONParser
from restaurant.serializers import OrderSerializer, ReservationSerializer, PaymentSerializer, ProductSerializer, \
    UserSerializer, CategorySerializer, OrderDetailSerializer, FeedbackSerializer, TableSerializer
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.core.cache import cache
from django.http import HttpResponse
from django.conf import settings
import json
import uuid
from rest_framework import viewsets, generics, permissions,status
import requests
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
import hmac,hashlib
from restaurantManagement.settings import MOMO_CONFIG
from .utils.momo import create_payment_request, verify_signature
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
import json
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

    @action(detail=False, methods=['post'], url_path='momo-payment')
    def momo_payment(self, request):
        cart_items = request.data.get('cart_items')

        if not cart_items:
            return Response({'error': 'No cart items provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Tạo đơn hàng tạm thời
        temp_order_id = f"temp_{request.user.id}_{int(time.time())}"

        # Tính tổng số tiền
        total_amount = sum(item['unitPrice'] * item['quantity'] for item in cart_items)

        # Tạo yêu cầu thanh toán tới MoMo
        momo_response = create_payment_request(temp_order_id, total_amount)

        if momo_response.get('payUrl'):
            # Lưu thông tin thanh toán tạm thời trong cache
            cache.set(temp_order_id, {
                'amount': total_amount,
                'cart_items': cart_items,
                'status': 'Pending'
            }, timeout=3600)  # Lưu trong cache với thời gian hết hạn

            # Trả về URL để redirect người dùng tới trang thanh toán của MoMo
            return Response({'payUrl': momo_response['payUrl']}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Failed to create MoMo payment'}, status=status.HTTP_400_BAD_REQUEST)

    @csrf_exempt
    @action(detail=False, methods=['post'], url_path='momo-notify')
    def momo_notify(self, request):
        data = json.loads(request.body)
        secret_key = settings.MOMO_CONFIG['secret_key']

        if not verify_signature(data, secret_key):
            return HttpResponse("Invalid signature", status=400)

        order_id = data.get('orderId')
        result_code = data.get('resultCode')

        # Xử lý kết quả thanh toán
        cached_data = cache.get(order_id)
        if not cached_data:
            return HttpResponse("Order not found", status=404)

        if result_code == '0':
            # Đơn hàng thanh toán thành công, lưu vào cơ sở dữ liệu
            try:
                # Tạo đơn hàng chính thức và lưu vào cơ sở dữ liệu
                order = Order.objects.create(
                    # Các trường khác của Order có thể cần thiết lập thêm
                    amount=cached_data['amount'],
                    status='Paid'
                )

                # Tạo các bản ghi thanh toán
                Payment.objects.create(
                    order=order,
                    amount=cached_data['amount'],
                    method='MoMo',
                    status='Successful',
                    transaction_id=data.get('requestId')
                )

                # Xóa dữ liệu cache
                cache.delete(order_id)

                return HttpResponse("Success", status=200)
            except Exception as e:
                return HttpResponse(f"Error: {str(e)}", status=500)
        else:
            # Cập nhật trạng thái thanh toán khi thất bại
            try:
                Payment.objects.create(
                    order_id=cached_data['order_id'],
                    amount=cached_data['amount'],
                    method='MoMo',
                    status='Failed',
                    transaction_id=data.get('requestId')
                )

                return HttpResponse("Failed", status=400)
            except Exception as e:
                return HttpResponse(f"Error: {str(e)}", status=500)


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


import logging
logger = logging.getLogger(__name__)

@csrf_exempt
def pay(request):
    if request.method == 'POST':
        try:
            # Lấy dữ liệu từ giỏ hàng (dạng JSON)
            cart_items = json.loads(request.body)

            # Kiểm tra dữ liệu có hợp lệ không
            if not isinstance(cart_items, list):
                return HttpResponseBadRequest('Invalid data format')

            # Tạo mã đơn hàng và tổng số tiền
            order_id = 12345
            total_amount = 0
            for item in cart_items:
                quantity = int(item['quantity'])
                unit_price = float(item['unitPrice'])
                total_amount += quantity * unit_price

            # Tạo yêu cầu thanh toán qua MoMo
            momo_response = create_payment_request(order_id, total_amount)

            # Trả về URL thanh toán từ MoMo
            return JsonResponse({'pay_url': momo_response.get('payUrl')})

        except json.JSONDecodeError:
            return HttpResponseBadRequest('Invalid JSON data')
        except (ValueError, TypeError) as e:
            return HttpResponseBadRequest(f'Invalid data: {e}')
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return HttpResponseBadRequest('Invalid HTTP method')


class CreateOrderView(APIView):
    def post(self, request):
        # Giả sử bạn nhận dữ liệu giỏ hàng từ request
        cart_items = request.data.get('cartItems')
        # Tạo đơn hàng mới và tính tổng giá trị
        order = Order.objects.create()  # Tạo đơn hàng mới
        total_amount = sum(item['price'] * item['quantity'] for item in cart_items)  # Tính tổng giá trị

        # Lưu các sản phẩm trong đơn hàng (cần thêm logic nếu cần)
        for item in cart_items:
            order.orderdetail_set.create(product_id=item['product_id'], quantity=item['quantity'], price=item['price'])

        # Trả về ID đơn hàng và tổng giá trị
        return Response({'order_id': order.id, 'total_amount': total_amount}, status=status.HTTP_201_CREATED)


# @csrf_exempt
# def handle_payments(request):
#     try:
#         # Lấy giá từ request.POST
#         # Các tham số gửi đến MoMo để lấy payUrl
#
#         print(request.POST.get('amount'))
#         endpoint = "https://test-payment.momo.vn/v2/gateway/api/create"
#         partnerCode = "MOMO"
#         accessKey = "F8BBA842ECF85"
#         secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz"
#         orderInfo = "Thanh toan qua MoMo"
#         redirectUrl = "http://localhost:3000/success"
#         ipnUrl = "http://192.168.1.17:8000/momo_ipn"
#         amount = request.POST.get('amount')
#         orderId = str(uuid.uuid4())
#         requestId = str(uuid.uuid4())
#         requestType = "payWithATM"
#         extraData = ""  # Pass empty value or Encode base64 JsonString
#
#         # Trước khi ký HMAC SHA256
#         rawSignature = f"accessKey={accessKey}&amount={amount}&extraData={extraData}&ipnUrl={ipnUrl}&orderId={orderId}&orderInfo={orderInfo}&partnerCode={partnerCode}&redirectUrl={redirectUrl}&requestId={requestId}&requestType={requestType}"
#
#         # Tạo chữ ký
#         h = hmac.new(bytes(secretKey, 'ascii'), bytes(rawSignature, 'ascii'), hashlib.sha256)
#         signature = h.hexdigest()
#
#         # Đối tượng JSON gửi đến endpoint MoMo
#         data = {
#             'partnerCode': partnerCode,
#             'partnerName': "Test",
#             'storeId': "MomoTestStore",
#             'requestId': requestId,
#             'amount': amount,
#             'orderId': orderId,
#             'orderInfo': orderInfo,
#             'redirectUrl': redirectUrl,
#             'ipnUrl': ipnUrl,
#             'lang': "vi",
#             'extraData': extraData,
#             'requestType': requestType,
#             'signature': signature
#         }
#
#         # Chuyển đổi dữ liệu thành JSON
#         data = json.dumps(data)
#         clen = len(data)
#
#         try:
#             # Gửi yêu cầu POST đến endpoint MoMo với dữ liệu JSON
#             response = requests.post(endpoint, data=data,
#                                      headers={'Content-Type': 'application/json', 'Content-Length': str(clen)})
#
#             # Xử lý phản hồi từ API
#             if response.status_code == 200:
#                 data = response.json()
#                 return JsonResponse({'payUrl': data.get('payUrl'),'orderId':orderId })
#             else:
#                 return JsonResponse({'error': f'Error: {response.status_code}'}, status=response.status_code)
#         except Exception as e:
#             return JsonResponse({'error': str(e)}, status=500)
#
#     except Exception as e:
#         return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def handle_payments(request):
    try:
        # Kiểm tra phương thức HTTP
        if request.method != 'POST':
            return JsonResponse({'error': 'Invalid request method'}, status=405)

        # Lấy dữ liệu từ request body (JSON)
        data = json.loads(request.body)

        # Lấy giá trị từ request (amount và cart_items)
        amount = data.get('amount')
        if not amount:
            return JsonResponse({'error': 'Missing amount'}, status=400)

        # Các tham số gửi đến MoMo để lấy payUrl
        endpoint = "https://test-payment.momo.vn/v2/gateway/api/create"
        partnerCode = "MOMO"
        accessKey = "F8BBA842ECF85"
        secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz"
        orderInfo = "Thanh toan qua MoMo"
        redirectUrl = "http://localhost:3000/success"
        ipnUrl = "http://192.168.1.17:8000/momo_ipn"
        orderId = str(uuid.uuid4())
        requestId = str(uuid.uuid4())
        requestType = "payWithATM"
        extraData = ""  # Pass empty value or Encode base64 JsonString

        # Tạo chữ ký HMAC SHA256
        rawSignature = f"accessKey={accessKey}&amount={amount}&extraData={extraData}&ipnUrl={ipnUrl}&orderId={orderId}&orderInfo={orderInfo}&partnerCode={partnerCode}&redirectUrl={redirectUrl}&requestId={requestId}&requestType={requestType}"

        # Tạo chữ ký
        h = hmac.new(bytes(secretKey, 'ascii'), bytes(rawSignature, 'ascii'), hashlib.sha256)
        signature = h.hexdigest()

        # Đối tượng JSON gửi đến endpoint MoMo
        payload = {
            'partnerCode': partnerCode,
            'partnerName': "Test",
            'storeId': "MomoTestStore",
            'requestId': requestId,
            'amount': amount,
            'orderId': orderId,
            'orderInfo': orderInfo,
            'redirectUrl': redirectUrl,
            'ipnUrl': ipnUrl,
            'lang': "vi",
            'extraData': extraData,
            'requestType': requestType,
            'signature': signature
        }

        # Gửi yêu cầu POST đến MoMo
        try:
            response = requests.post(endpoint, json=payload, headers={'Content-Type': 'application/json'})

            # Xử lý phản hồi từ API MoMo
            if response.status_code == 200:
                momo_response = response.json()
                return JsonResponse({'payUrl': momo_response.get('payUrl'), 'orderId': orderId})
            else:
                return JsonResponse({'error': f'Error from MoMo: {response.status_code}'}, status=response.status_code)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)










from django.shortcuts import redirect
from django.http import JsonResponse
from .models import Payment, Order, OrderDetail
from decimal import Decimal
from django.views.decorators.csrf import csrf_exempt
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def momo_success(request):
    if request.method == 'GET':
        # Lấy dữ liệu từ query parameters
        partner_code = request.GET.get('partnerCode')
        order_id = request.GET.get('orderId')
        amount = request.GET.get('amount')
        transaction_id = request.GET.get('transId')
        result_code = request.GET.get('resultCode')

        # Kiểm tra result_code để xác định xem thanh toán có thành công không
        if result_code == '0':  # 0 nghĩa là thành công
            try:
                # Tìm kiếm đơn hàng tương ứng
                order = Order.objects.get(id=order_id)

                # Tạo hoặc cập nhật bản ghi thanh toán
                payment, created = Payment.objects.get_or_create(
                    order=order,
                    defaults={
                        'amount': Decimal(amount),
                        'method': 'MoMo',
                        'status': 'Successful',
                        'transaction_id': transaction_id
                    }
                )

                # Nếu cần tạo chi tiết đơn hàng, bạn có thể làm tương tự ở đây
                # Ví dụ, nếu bạn có dữ liệu chi tiết sản phẩm trong giỏ hàng
                cart_items = request.session.get('cart_items', [])
                for item in cart_items:
                    # Tạo bản ghi OrderDetail cho từng sản phẩm trong giỏ hàng
                    OrderDetail.objects.create(
                        order=order,
                        product=item['product'],  # Giả sử bạn có trường product
                        quantity=item['quantity'],
                        price=item['price']
                    )

                return JsonResponse({'message': 'Payment and order data saved successfully!'}, status=200)

            except Order.DoesNotExist:
                return JsonResponse({'message': 'Order not found!'}, status=404)
            except Exception as e:
                logger.error(f"Error saving payment: {str(e)}")
                return JsonResponse({'message': str(e)}, status=500)
        else:
            return JsonResponse({'message': 'Payment failed!'}, status=400)

    return JsonResponse({'message': 'Invalid request method!'}, status=400)



@csrf_exempt
def save_cart(request):
    if request.method == "POST":
        try:
            # Lấy giỏ hàng từ request body
            cart_items = request.POST.get('cart_items')
            # Lưu giỏ hàng vào session hoặc xử lý theo ý bạn

            return JsonResponse({"message": "Cart saved successfully."}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method."}, status=400)

















import hashlib
import hmac
import urllib.parse
from django.http import JsonResponse, HttpResponseBadRequest
from django.conf import settings
from datetime import datetime
from .models import Order

def create_vnpay_url(request):
    vnp_TmnCode = settings.VNPAY_TMN_CODE
    vnp_HashSecret = settings.VNPAY_HASH_SECRET
    vnp_Url = settings.VNPAY_URL
    return_url = "http://localhost:3000/Payment_return/"

    amount = request.GET.get("amount")
    if amount is None:
        return HttpResponseBadRequest("Amount is required.")

    try:
        amount = int(amount)
    except ValueError:
        return HttpResponseBadRequest("Invalid amount value.")

    txn_ref = random.randint(1, 9999)
    ip_addr = request.META.get('REMOTE_ADDR', '')

    current_time = datetime.now()
    expire_time = current_time + timedelta(minutes=15)

    input_data = {
        'vnp_Version': '2.1.0',
        'vnp_Command': 'pay',
        'vnp_TmnCode': vnp_TmnCode,
        'vnp_Amount': str(amount*100),
        'vnp_BankCode' : 'NCB',
        'vnp_CurrCode': 'VND',
        'vnp_TxnRef': txn_ref,
        'vnp_OrderInfo': 'Bill',
        'vnp_OrderType': 'billpayment',
        'vnp_Locale': 'vn',
        'vnp_ReturnUrl': return_url,
        'vnp_IpAddr': ip_addr,
        'vnp_CreateDate': current_time.strftime('%Y%m%d%H%M%S'),
        'vnp_ExpireDate': expire_time.strftime('%Y%m%d%H%M%S')
    }

    sorted_data = sorted(input_data.items())
    query_string = '&'.join(f"{key}={urllib.parse.quote(str(value), safe='')}" for key, value in sorted_data)

    # Tính toán mã bảo mật
    secure_hash = hmac.new(vnp_HashSecret.encode('utf-8'), query_string.encode('utf-8'), hashlib.sha512).hexdigest()
    payment_url = f"{vnp_Url}?{query_string}&vnp_SecureHash={secure_hash}"
    print('Payment URL:', payment_url)  # Kiểm tra URL
    return JsonResponse({"payment_url": payment_url})

# print('Payment URL:', payment_url)  # Kiểm tra URL



def vnpay_return(request):
    vnp_HashSecret = settings.VNPAY_HASH_SECRET
    vnp_data = request.GET.dict()

    # Lấy checksum từ VNPay
    vnp_secure_hash = vnp_data.pop('vnp_SecureHash', None)

    # Tạo lại checksum để kiểm tra
    sorted_data = sorted(vnp_data.items())
    query_string = '&'.join(f"{key}={urllib.parse.quote(str(value), safe='')}" for key, value in sorted_data)
    verify_hash = hmac.new(vnp_HashSecret.encode('utf-8'), query_string.encode('utf-8'), hashlib.sha512).hexdigest()

    if vnp_secure_hash == verify_hash:
        # Xử lý logic khi thanh toán thành công
        return JsonResponse({"message": "Payment successful"})
    else:
        # Xử lý logic khi thanh toán thất bại
        return JsonResponse({"message": "Payment failed"})