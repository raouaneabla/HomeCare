from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
import uuid

from .serializers import (
    RegisterSerializer,
    PrestataireSerializer,
    ReservationSerializer,
    PrestataireProfileSerializer
)
from .models import CustomUser, Reservation, PrestataireProfile, PrestataireImage


# ======================== REGISTER ========================
@api_view(['POST'])
@permission_classes([AllowAny])
def RegisterView(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()

    refresh = RefreshToken.for_user(user)

    return Response({
        'id': user.id,
        'username': user.username,
        'is_client': user.is_client,
        'is_prestataire': user.is_prestataire,
        'latitude': user.latitude,
        'longitude': user.longitude,
        'address': user.address,
        'access': str(refresh.access_token),
        'refresh': str(refresh)
    }, status=status.HTTP_201_CREATED)


# ======================== LOGIN ========================
@api_view(['POST'])
@permission_classes([AllowAny])
def LoginView(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)
    if not user:
        return Response(
            {'detail': 'Identifiants incorrects'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    refresh = RefreshToken.for_user(user)

    return Response({
        'id': user.id,
        'username': user.username,
        'is_client': user.is_client,
        'is_prestataire': user.is_prestataire,
        'latitude': user.latitude,
        'longitude': user.longitude,
        'address': user.address,
        'access': str(refresh.access_token),
        'refresh': str(refresh)
    })


# ======================== LOGOUT ========================
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return Response({'message': 'Déconnecté'}, status=status.HTTP_200_OK)


# ======================== CURRENT USER ========================
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'is_client': user.is_client,
            'is_prestataire': user.is_prestataire,
            'latitude': user.latitude,
            'longitude': user.longitude,
            'address': user.address
        })


# ======================== PRESTATAIRES ========================
class PrestataireListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        prestataires = CustomUser.objects.filter(
            is_prestataire=True,
            is_available=True
        )
        serializer = PrestataireSerializer(
            prestataires,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)


# ======================== RESERVATIONS ========================
class CreateReservationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.is_client:
            return Response(
                {"detail": "Seuls les clients peuvent réserver"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ReservationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(client=request.user)

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ClientReservationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_client:
            return Response(
                {"detail": "Accès réservé aux clients"},
                status=status.HTTP_403_FORBIDDEN
            )

        reservations = Reservation.objects.filter(
            client=request.user
        ).order_by('-created_at')

        serializer = ReservationSerializer(reservations, many=True)
        return Response(serializer.data)


class PrestataireReservationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_prestataire:
            return Response(
                {"detail": "Accès réservé aux prestataires"},
                status=status.HTTP_403_FORBIDDEN
            )

        reservations = Reservation.objects.filter(
            prestataire=request.user
        ).order_by('-created_at')

        data = []
        for r in reservations:
            data.append({
                'id': r.id,
                'client_username': r.client.username,
                'date': r.date,
                'address': r.address,
                'description': r.description,
                'status': r.status
            })

        return Response(data)


class UpdateReservationStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, reservation_id):
        if not request.user.is_prestataire:
            return Response(
                {"detail": "Accès interdit"},
                status=status.HTTP_403_FORBIDDEN
            )

        reservation = get_object_or_404(
            Reservation,
            id=reservation_id,
            prestataire=request.user
        )

        status_value = request.data.get("status")

        if status_value == "accepted":
            reservation.status = "ACCEPTEE"
        elif status_value == "refused":
            reservation.status = "REFUSEE"
        else:
            return Response(
                {"detail": "Statut invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )

        reservation.save()

        return Response({
            "message": "Statut mis à jour",
            "status": reservation.status
        })


# ======================== PROFIL PRESTATAIRE ========================
class PrestataireProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_prestataire:
            return Response({"detail": "Accès interdit"}, status=403)

        profile, _ = PrestataireProfile.objects.get_or_create(user=request.user)

        user_data = PrestataireSerializer(
            request.user,
            context={'request': request}
        ).data

        profile_data = PrestataireProfileSerializer(
            profile,
            context={'request': request}
        ).data

        return Response({**user_data, **profile_data})


# ======================== DELETE IMAGE ========================
class DeletePrestataireImageView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, image_id):
        image = get_object_or_404(
            PrestataireImage,
            id=image_id,
            profile__user=request.user
        )

        image.image.delete(save=False)
        image.delete()

        return Response({"message": "Image supprimée"})


# ======================== PRESTATAIRE PUBLIC ========================
class PublicPrestataireView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, prestataire_id):
        prestataire = get_object_or_404(
            CustomUser,
            id=prestataire_id,
            is_prestataire=True
        )
        serializer = PrestataireSerializer(
            prestataire,
            context={'request': request}
        )
        return Response(serializer.data)


# ============================================================
# 🔐 MOT DE PASSE OUBLIÉ — PLAN B (TOKEN TEMPORAIRE)
# ============================================================

# 1️⃣ DEMANDE DE RESET (email + token)
class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')

        if not email:
            return Response(
                {"detail": "Email requis"},
                status=status.HTTP_400_BAD_REQUEST
            )

        users = CustomUser.objects.filter(email=email)

        if not users.exists():
            return Response(
                {"detail": "Utilisateur introuvable"},
                status=status.HTTP_404_NOT_FOUND
            )

        for user in users:
            user.reset_token = uuid.uuid4()
            user.reset_token_expiry = timezone.now() + timedelta(minutes=30)
            user.save()

        return Response({
            "message": "Token généré",
            "reset_token": str(user.reset_token)
        })


# 2️⃣ CONFIRMATION RESET (token + nouveau mot de passe)
class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        if not token or not new_password:
            return Response(
                {"detail": "Token et mot de passe requis"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = CustomUser.objects.get(reset_token=token)
        except CustomUser.DoesNotExist:
            return Response(
                {"detail": "Token invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if user.reset_token_expiry < timezone.now():
            return Response(
                {"detail": "Token expiré"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.reset_token = None
        user.reset_token_expiry = None
        user.save()

        return Response({"message": "Mot de passe réinitialisé avec succès"})