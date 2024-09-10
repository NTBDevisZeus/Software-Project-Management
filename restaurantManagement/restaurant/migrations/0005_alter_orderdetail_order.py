# Generated by Django 5.1 on 2024-09-10 06:52

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('restaurant', '0004_alter_order_total_amount'),
    ]

    operations = [
        migrations.AlterField(
            model_name='orderdetail',
            name='order',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='order_details', to='restaurant.order'),
        ),
    ]
