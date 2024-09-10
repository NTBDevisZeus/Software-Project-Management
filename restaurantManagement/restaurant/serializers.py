from django.contrib.auth import get_user_model
from rest_framework import serializers
from restaurant.models import User, Feedback, Product, Table, Reservation, Order, OrderDetail, Payment, Category

class UserSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        req = super().to_representation(instance)
        if instance.avatar:
            req['avatar'] = instance.avatar.url
        return req

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

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']


class OrderDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderDetail
        fields = ['id', 'product', 'quantity', 'unit_price']


class OrderDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderDetail
        fields = ['id', 'product', 'quantity']


class OrderSerializer(serializers.ModelSerializer):
    order_details = OrderDetailSerializer(many=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'date', 'total_amount', 'status', 'order_details']
        read_only_fields = ['total_amount', 'status']

    def create(self, validated_data):
        order_details_data = validated_data.pop('order_details', [])
        order = Order.objects.create(**validated_data)

        for detail_data in order_details_data:
            OrderDetail.objects.create(order=order, **detail_data)

        # Update status to 1 after creating the order
        order.update_status()

        return order
    # def create(self, validated_data):
    #     order_details_data = validated_data.pop('order_details')
    #     order = Order.objects.create(**validated_data)
    #
    #     total_amount = 0
    #     for detail_data in order_details_data:
    #         product = detail_data.get('product')
    #         quantity = detail_data.get('quantity')
    #         unit_price = detail_data.get('unit_price')
    #
    #         OrderDetail.objects.create(
    #             order=order,
    #             product=product,
    #             quantity=quantity,
    #             unit_price=unit_price
    #         )
    #
    #         total_amount += quantity * unit_price
    #
    #     order.total_amount = total_amount
    #     order.save()
    #
    #     return order


class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = ['id', 'name', 'capacity', 'is_active']

class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = ['id', 'user', 'table', 'date', 'status']
        extra_kwargs = {
            'status': {'required': False}  # status is optional for POST requests
        }

    def validate(self, data):
        # Example validation: Ensure the table is active
        table = data.get('table')
        if not table.is_active:
            raise serializers.ValidationError("The table is not active.")
        return data

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['order', 'payment_method', 'payment_date', 'payment_status']


class ProductSerializer(serializers.ModelSerializer):
    category_id = serializers.IntegerField(write_only=True)  # Only for input

    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'quantity', 'description', 'rate', 'pr_image', 'category_id']

    def create(self, validated_data):
        category_id = validated_data.pop('category_id')
        category = Category.objects.get(id=category_id)
        product = Product.objects.create(category=category, **validated_data)
        return product
