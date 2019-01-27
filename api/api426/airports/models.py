from django.db import models

# Create your models here.
class Airport(models.model):
	code = models.CharField(max_length=5)
