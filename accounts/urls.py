from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from .views import (
    # AUTH
    RegisterView,
    LoginView,
    LogoutView,
    CurrentUserView,

    # PASSWORD RESET (PLAN B)
    PasswordResetRequestView,
    PasswordResetConfirmView,

    # PRESTATAIRES
    PrestataireListView,
    PrestataireProfileView,
    PublicPrestataireView,
    DeletePrestataireImageView,

    # RESERVATIONS
    CreateReservationView,
    ClientReservationListView,
    PrestataireReservationListView,
    UpdateReservationStatusView,
)

urlpatterns = [

    # ================= AUTH =================
    path('register/', RegisterView, name='register'),
    path('login/', LoginView, name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', CurrentUserView.as_view(), name='current-user'),

    # ============ MOT DE PASSE OUBLIÉ ============
    path(
        'password-reset/request/',
        PasswordResetRequestView.as_view(),
        name='password-reset-request'
    ),
    path(
        'password-reset/confirm/',
        PasswordResetConfirmView.as_view(),
        name='password-reset-confirm'
    ),

    # ================= PRESTATAIRES =================
    path(
        'prestataires/',
        PrestataireListView.as_view(),
        name='prestataire-list'
    ),
    path(
        'prestataire/profile/',
        PrestataireProfileView.as_view(),
        name='prestataire-profile'
    ),
    path(
        'prestataires/<int:prestataire_id>/',
        PublicPrestataireView.as_view(),
        name='public-prestataire'
    ),
    path(
        'prestataire/image/<int:image_id>/delete/',
        DeletePrestataireImageView.as_view(),
        name='delete-prestataire-image'
    ),

    # ================= RESERVATIONS =================
    path(
        'reservations/create/',
        CreateReservationView.as_view(),
        name='create-reservation'
    ),
    path(
        'client/reservations/',
        ClientReservationListView.as_view(),
        name='client-reservations'
    ),
    path(
        'prestataire/reservations/',
        PrestataireReservationListView.as_view(),
        name='prestataire-reservations'
    ),
    path(
        'reservation/<int:reservation_id>/status/',
        UpdateReservationStatusView.as_view(),
        name='update-reservation-status'
    ),
]

# ================= MEDIA (DEV) =================
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )