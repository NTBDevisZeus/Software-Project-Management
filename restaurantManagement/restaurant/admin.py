from django.contrib import admin

from django.contrib import admin
from django.db.models import Count
from django.db.models.functions import ExtractYear, ExtractMonth, ExtractQuarter
from django.template.response import TemplateResponse
from django.urls import path
from .models import User, Product, Table, Order, OrderDetail, Reservation, Payment, Feedback, Category
from django.db.models import Sum

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
    list_display = ('order', 'method', 'amount', 'status')  # Đổi 'date' thành 'payment_date'
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

class RestaurantAppAdminSite(admin.AdminSite):
    site_header = "Admin"
    index_template = 'admin/index.html'

    def get_urls(self):
        return [
            path('orderstats/', self.orderstats_view),
            path('revenuestats/', self.revenue_view),  # Thêm URL cho thống kê doanh thu
        ] + super().get_urls()

    def orderstats_view(self, request):
        total_orders = Order.objects.count()

        # Lấy tùy chọn xem thống kê và năm đã chọn từ request
        view_option = request.GET.get('view', 'year')
        selected_year = request.GET.get('year')

        # Lấy danh sách các năm có đơn hàng
        years = Order.objects.annotate(year=ExtractYear('date')).values_list('year', flat=True).distinct().order_by(
            'year')

        # Thực hiện thống kê dựa trên tùy chọn và năm đã chọn
        if view_option == 'month' and selected_year:
            stats = Order.objects.filter(date__year=selected_year).annotate(month=ExtractMonth('date')).values(
                'month').annotate(count=Count('id')).order_by('month')
        elif view_option == 'quarter' and selected_year:
            stats = Order.objects.filter(date__year=selected_year).annotate(quarter=ExtractQuarter('date')).values(
                'quarter').annotate(count=Count('id')).order_by('quarter')
        else:
            stats = Order.objects.annotate(year=ExtractYear('date')).values('year').annotate(
                count=Count('id')).order_by('year')

        # Trả về template với dữ liệu thống kê
        return TemplateResponse(request, 'admin/orderstats.html', {
            "total_orders": total_orders,
            "view_option": view_option,
            "selected_year": selected_year,
            "years": years,
            "stats": stats,
        })

    def revenue_view(self, request):
        total_revenue = Order.objects.aggregate(total=Sum('total_amount'))['total'] or 0
        view_option = request.GET.get('view', 'year')
        selected_year = request.GET.get('year')

        years = Order.objects.annotate(year=ExtractYear('date')).values_list('year', flat=True).distinct().order_by(
            'year')

        if view_option == 'month' and selected_year:
            stats = Order.objects.filter(date__year=selected_year).annotate(month=ExtractMonth('date')).values(
                'month').annotate(total_revenue=Sum('total_amount')).order_by('month')
        elif view_option == 'quarter' and selected_year:
            stats = Order.objects.filter(date__year=selected_year).annotate(quarter=ExtractQuarter('date')).values(
                'quarter').annotate(total_revenue=Sum('total_amount')).order_by('quarter')
        else:
            stats = Order.objects.annotate(year=ExtractYear('date')).values('year').annotate(
                total_revenue=Sum('total_amount')).order_by('year')

        return TemplateResponse(request, 'admin/revenuestats.html', {
            "total_revenue": total_revenue,
            "view_option": view_option,
            "selected_year": selected_year,
            "years": years,
            "stats": stats,
        })


admin_site = RestaurantAppAdminSite('myrestaurant')
# Register your models here.
admin_site.register(User,UserAdmin)
admin_site.register(Category,CategoryAdmin)
admin_site.register(Product,ProductAdmin)
admin_site.register(Table,TableAdmin)
admin_site.register(Reservation,ReservationAdmin)
admin_site.register(Payment,PaymentAdmin)
admin_site.register(Feedback,FeedbackAdmin)
admin_site.register(Order,OrderAdmin)
