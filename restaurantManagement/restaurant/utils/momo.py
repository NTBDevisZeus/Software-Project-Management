import requests
import hashlib
import hmac
import json
from django.conf import settings

def create_payment_request(order_id, amount):
    endpoint = settings.MOMO_CONFIG['endpoint']
    access_key = settings.MOMO_CONFIG['access_key']
    partner_code = settings.MOMO_CONFIG['partner_code']
    secret_key = settings.MOMO_CONFIG['secret_key']

    # Payload cho MoMo API
    payload = {
        'partnerCode': partner_code,
        'accessKey': access_key,
        'requestId': str(order_id),
        'amount': str(amount),
        'orderId': str(order_id),
        'orderInfo': 'Payment for order {}'.format(order_id),
        'returnUrl': settings.MOMO_CONFIG['return_url'],
        'notifyUrl': settings.MOMO_CONFIG['notify_url'],
        'requestType': 'captureMoMoWallet'
    }

    # Tạo chữ ký
    raw_signature = f"accessKey={access_key}&amount={amount}&orderId={order_id}&orderInfo=Payment for order {order_id}"
    signature = hmac.new(secret_key.encode(), raw_signature.encode(), hashlib.sha256).hexdigest()
    payload['signature'] = signature

    # Gửi yêu cầu đến MoMo
    response = requests.post(endpoint, json=payload)
    return response.json()

def verify_signature(data, secret_key):
    raw_signature = f"accessKey={data['accessKey']}&amount={data['amount']}&orderId={data['orderId']}&orderInfo={data['orderInfo']}"
    generated_signature = hmac.new(secret_key.encode(), raw_signature.encode(), hashlib.sha256).hexdigest()
    return generated_signature == data['signature']
