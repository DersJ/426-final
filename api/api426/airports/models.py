from django.db import models

# Create your models here.
class Airport(models.Model):
	code = models.CharField(max_length=5)
	city = models.CharField(max_length=200)
	longitude = models.FloatField()
	latitude = models.FloatField()

class Flight(models.Model):
	airline_id = models.ForeignKey('Airline', on_delete=models.CASCADE)
	departs_at = models.TimeField()
	arrives_at = models.TimeField()
	arrival_id = models.ForeignKey('Airport', on_delete=models.CASCADE)
	departure_id = models.ForeignKey('Airport', on_delete=models.CASCADE)

class FlightInstance(models.Model):

class Airline(models.Model):

class PlaneType(models.Model):
