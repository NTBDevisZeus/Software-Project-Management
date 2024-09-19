from datetime import timedelta

from cloudinary.models import CloudinaryField
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.utils import timezone


# Create your models here.

class User(AbstractUser):
    class USER_ROLES(models.IntegerChoices):
        MANAGER = 1,'manager',
        CUSTOMER = 2,'customer'


    id = models.AutoField(primary_key=True)
    role = models.IntegerField(choices=USER_ROLES.choices, null = True, default=2)
    phone_number = models.CharField(max_length=15, blank= True,null= True)
    email = models.EmailField(unique=True)
    avatar = CloudinaryField(null=True,blank= True)




    def __str__(self):
        return f'{self.last_name} {self.first_name}'



class BaseModel(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        abstract = True




class Category(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField()
    description = models.TextField()
    rate = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    pr_image = CloudinaryField(null=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')

    def __str__(self):
        return self.name

class Table(models.Model):
    name = models.CharField(max_length=255)
    capacity = models.IntegerField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Reservation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    table = models.ForeignKey(Table, on_delete=models.CASCADE)
    date = models.DateField()
    status = models.BooleanField(default=False)

    def __str__(self):
        return f'Reservation for {self.user} on {self.date}'


class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.pk:  # Only update total_amount if this is an existing Order
            super(Order, self).save(*args, **kwargs)  # Save first to get a primary key
        else:
            self.total_amount = sum([detail.quantity * detail.product.price for detail in self.order_details.all()])
            super(Order, self).save(*args, **kwargs)

    def update_status(self):
        self.status = 1  # Update status to 1 when the order is successfully created
        self.save()

class OrderDetail(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_details')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()

    def save(self, *args, **kwargs):
        # Call the parent save method
        super(OrderDetail, self).save(*args, **kwargs)
        # Recalculate the total_amount in the associated Order
        self.order.save()

class Payment(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=100)  # MoMo, ATM, etc.
    status = models.CharField(max_length=50,  default='Pending')  # 'Pending', 'Failed', 'Successful'
    transaction_id = models.CharField(max_length=255, null=True, blank=True)

    def update_status_from_momo(self, result_code, trans_id):
        if result_code == 0:
            self.status = 'Successful'
        else:
            self.status = 'Failed'
        self.transaction_id = trans_id
        self.save()


class Feedback(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    rate = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    fb_image = CloudinaryField( blank=True, null=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE)