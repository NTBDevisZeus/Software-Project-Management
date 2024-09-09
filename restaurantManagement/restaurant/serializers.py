from django.contrib.auth import get_user_model
from rest_framework import serializers
from restaurant.models import User, Feedback, Product, Table, Reservation, Order, OrderDetail, Payment

## Quản lý đơn hàng chi tiết
class OrderDetailSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = OrderDetail
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price']

## Quản lý đơn hàng
class OrderSerializer(serializers.ModelSerializer):
    order_details = OrderDetailSerializer(many=True, write_only=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'date', 'total_amount', 'status', 'order_details']

    def create(self, validated_data):
        order_details_data = validated_data.pop('order_details')
        order = Order.objects.create(**validated_data)

        total_amount = 0
        for order_detail_data in order_details_data:
            product = order_detail_data['product']
            quantity = order_detail_data['quantity']
            unit_price = product.price

            # Tạo chi tiết đơn hàng
            OrderDetail.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                unit_price=unit_price
            )

            total_amount += quantity * unit_price

        # Cập nhật tổng số tiền
        order.total_amount = total_amount
        order.save()

        return order

## Thống kê
class StatisticsSerializer(serializers.Serializer):
    total_orders = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_products_sold = serializers.IntegerField()
    average_order_value = serializers.DecimalField(max_digits=10, decimal_places=2)

## Bàn
class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = ['id', 'name', 'capacity', 'is_active']

## Đặt bàn
class ReservationSerializer(serializers.ModelSerializer):
    table = TableSerializer(read_only=True)
    table_id = serializers.PrimaryKeyRelatedField(queryset=Table.objects.all(), write_only=True, source='table')

    class Meta:
        model = Reservation
        fields = ['id', 'user', 'table', 'table_id', 'date', 'status']

    def create(self, validated_data):
        # Đảm bảo rằng không có đặt bàn trùng ngày và bàn
        if Reservation.objects.filter(table=validated_data['table'], date=validated_data['date']).exists():
            raise serializers.ValidationError("Bàn này đã được đặt cho ngày này.")
        return super().create(validated_data)

## Thanh toán
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['order', 'payment_method', 'payment_date', 'payment_status']

## Quản lý sản phẩm
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'quantity', 'description', 'rate', 'pr_image']

## Profile



class UserSerializer(serializers.ModelSerializer):
    # Chỉnh dữ liệu đối tượng User thành Json khi API trả về dữ liệu
    def to_representation(self, instance):
        req = super().to_representation(instance)
        if instance.avatar:
            req['avatar'] = instance.avatar.url
        return req

    #Mã hóa mk trước khi đưa vào cơ sở dữ liệu
    def create(self, validated_data):
        data = validated_data.copy()

        user = User(**data)
        user.set_password(user.password)
        user.save()

        return user

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'phone_number', 'avatar']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }
