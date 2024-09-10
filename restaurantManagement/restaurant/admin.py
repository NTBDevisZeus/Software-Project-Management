from django.contrib import admin

from django.contrib import admin
from .models import User, Product, Table, Order, OrderDetail, Reservation, Payment, Feedback, Category


# Đăng ký User model vào trang quản trị
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'phone_number', 'role')
    search_fields = ('username', 'email')
    list_filter = ('role',)

# Đăng ký Product model vào trang quản trị
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'quantity', 'rate')
    search_fields = ('name',)
    list_filter = ('rate',)

# Đăng ký Table model
@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    list_display = ('name', 'capacity', 'is_active')
    search_fields = ('name',)
    list_filter = ('is_active',)

# Đăng ký Order model
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'total_amount', 'status')
    list_filter = ('status',)
    search_fields = ('user__username',)

# Đăng ký OrderDetail model
@admin.register(OrderDetail)
class OrderDetailAdmin(admin.ModelAdmin):
    list_display = ('order', 'product', 'quantity')
    search_fields = ('order__id', 'product__name')

# Đăng ký Reservation model
@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('user', 'table', 'date', 'status')
    search_fields = ('user__username', 'table__name')

# Đăng ký Payment model
@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('order', 'payment_method', 'payment_date', 'payment_status')
    search_fields = ('order__id',)

# Đăng ký Feedback model
@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('user', 'content', 'rate')
    search_fields = ('user__username', 'content')
    list_filter = ('rate',)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)


# Register your models here.
