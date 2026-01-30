from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    CustomUser,
    PrestataireProfile,
    PrestataireImage,
    Reservation
)

# =========================
# CUSTOM USER (CLIENT / PRESTATAIRE)
# =========================
class CustomUserAdmin(UserAdmin):
    model = CustomUser

    list_display = (
        'username',
        'email',
        'is_client',
        'is_prestataire',
        'service_type',   # ✅ RESTE ICI (prestataire)
        'phone',
        'is_staff',
        'is_active',
    )

    list_filter = (
        'is_client',
        'is_prestataire',
        'service_type',   # ✅ RESTE ICI
        'is_staff',
        'is_active',
    )

    fieldsets = UserAdmin.fieldsets + (
        ("Informations prestataire", {
            "fields": (
                'is_client',
                'is_prestataire',
                'service_type',   # ✅ RESTE ICI
                'phone',
                'address',
                'latitude',
                'longitude',
                'profile_photo',
                'is_available',
            )
        }),
    )


# =========================
# PROFIL PRESTATAIRE
# =========================
@admin.register(PrestataireProfile)
class PrestataireProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'bio', 'city', 'created_at')
    search_fields = ('user__username', 'city')


# =========================
# IMAGES PRESTATAIRE
# =========================
@admin.register(PrestataireImage)
class PrestataireImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'profile', 'uploaded_at')
    list_filter = ('uploaded_at',)


# =========================
# RESERVATIONS (SANS service_type)
# =========================
@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = (
        'client',
        'prestataire',
        'status',
        'date',
        'created_at',
    )
    list_filter = (
        'status',
        'date',
    )


# =========================
# REGISTER USER
# =========================
admin.site.register(CustomUser, CustomUserAdmin)
