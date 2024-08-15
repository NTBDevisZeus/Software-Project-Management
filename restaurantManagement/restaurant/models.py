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
    role = models.IntegerField(choices=USER_ROLES.choices)
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


class Feedback(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    rate = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    fb_image = CloudinaryField(null=True)

class Product(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField()
    description = models.TextField()
    rate = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    pr_image = CloudinaryField(null=True)

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
    status = models.IntegerField()

    def __str__(self):
        return f'Reservation for {self.user} on {self.date}'


class Order(models.Model):
    user =models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.IntegerField()


class OrderDetail(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

class Payment(models.Model):

    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    payment_method = models.IntegerField()
    payment_date = models.DateField()
    payment_status = models.IntegerField()

