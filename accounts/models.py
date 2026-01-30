from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
import uuid

# =======================
# CUSTOM USER
# =======================
class CustomUser(AbstractUser):
    # -----------------------
    # RÔLES
    # -----------------------
    is_client = models.BooleanField(default=False)
    is_prestataire = models.BooleanField(default=False)

    # -----------------------
    # CHAMPS COMMUNS
    # -----------------------
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)

    # -----------------------
    # PRESTATAIRE UNIQUEMENT
    # -----------------------
    SERVICE_CHOICES = (
        ('MENAGE', 'Ménage'),
        ('JARDINAGE', 'Jardinage'),
    )
    service_type = models.CharField(
        max_length=20,
        choices=SERVICE_CHOICES,
        blank=True,
        null=True
    )

    profile_photo = models.ImageField(upload_to='profile_photos/', blank=True, null=True)
    is_available = models.BooleanField(default=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)

    # -----------------------
    # OUBLI MOT DE PASSE (PLAN B)
    # -----------------------
    reset_token = models.UUIDField(blank=True, null=True)
    reset_token_expiry = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.username

    @property
    def profile_photo_url(self):
        if self.profile_photo:
            return self.profile_photo.url
        return None


# =======================
# RESERVATION
# =======================
class Reservation(models.Model):
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="client_reservations"
    )
    prestataire = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="prestataire_reservations"
    )
    description = models.TextField()
    address = models.CharField(max_length=255)
    date = models.DateField()

    STATUS_CHOICES = (
        ("EN_ATTENTE", "En attente"),
        ("ACCEPTEE", "Acceptée"),
        ("REFUSEE", "Refusée"),
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="EN_ATTENTE"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.client.username} → {self.prestataire.username} ({self.date})"


# =======================
# PROFIL PRESTATAIRE
# =======================
class PrestataireProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='prestataire_profile'
    )
    bio = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profil prestataire - {self.user.username}"

    @property
    def images_urls(self):
        return [img.image.url for img in self.images_set.all()]


# =======================
# IMAGES SUPPLÉMENTAIRES PRESTATAIRE
# =======================
class PrestataireImage(models.Model):
    profile = models.ForeignKey(
        PrestataireProfile,
        on_delete=models.CASCADE,
        related_name='images_set'
    )
    image = models.ImageField(upload_to='prestataire_images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image {self.id}"

    @property
    def image_url(self):
        if self.image:
            return self.image.url
        return None