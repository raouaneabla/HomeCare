from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser, Reservation, PrestataireProfile, PrestataireImage

# =======================
# REGISTER
# =======================
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'username', 'email', 'password',
            'is_client', 'is_prestataire',
            'phone', 'address', 'service_type',
            'latitude', 'longitude',
        ]

    def create(self, validated_data):
        user = CustomUser(
            username=validated_data['username'],
            email=validated_data['email'],
            is_client=validated_data.get('is_client', True),
            is_prestataire=validated_data.get('is_prestataire', False),
            phone=validated_data.get('phone', ''),
            address=validated_data.get('address', ''),
            service_type=validated_data.get('service_type', ''),
            latitude=validated_data.get('latitude'),
            longitude=validated_data.get('longitude'),
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


# =======================
# LOGIN
# =======================
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(
            username=data.get('username'),
            password=data.get('password')
        )
        if not user:
            raise serializers.ValidationError("Nom d'utilisateur ou mot de passe incorrect")
        data['user'] = user
        return data


# =======================
# PRESTATAIRE (USER)
# =======================
class PrestataireSerializer(serializers.ModelSerializer):
    address_display = serializers.SerializerMethodField()
    profile_photo_url = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()  # renvoie id + url pour suppression

    class Meta:
        model = CustomUser
        fields = [
            'id',
            'full_name',
            'username',
            'service_type',
            'phone',
            'address_display',
            'latitude',
            'longitude',
            'profile_photo_url',
            'images',
        ]

    def get_address_display(self, obj):
        return obj.address if obj.address else "Ville inconnue"

    def get_profile_photo_url(self, obj):
        request = self.context.get('request')
        if obj.profile_photo:
            return request.build_absolute_uri(obj.profile_photo.url) if request else obj.profile_photo.url
        return "https://via.placeholder.com/150"

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_images(self, obj):
        try:
            profile = obj.prestataire_profile
            images = profile.images_set.all()
            request = self.context.get('request')
            return [
                {
                    "id": img.id,
                    "url": request.build_absolute_uri(img.image.url) if request else img.image.url
                }
                for img in images
            ]
        except PrestataireProfile.DoesNotExist:
            return []


# =======================
# RESERVATIONS
# =======================
class ReservationSerializer(serializers.ModelSerializer):
    client_username = serializers.ReadOnlyField(source='client.username')
    prestataire_username = serializers.ReadOnlyField(source='prestataire.username')

    class Meta:
        model = Reservation
        fields = [
            'id',
            'client',
            'client_username',
            'prestataire',
            'prestataire_username',
            'description',
            'address',
            'date',
            'status',
            'created_at',
        ]
        read_only_fields = ['client', 'status', 'created_at']


# =======================
# PROFIL PRESTATAIRE
# =======================
class PrestataireProfileSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField()  # renvoie id + url

    class Meta:
        model = PrestataireProfile
        fields = [
            'id',
            'bio',
            'city',
            'images',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_images(self, obj):
        request = self.context.get('request')
        return [
            {
                "id": img.id,
                "url": request.build_absolute_uri(img.image.url) if request else img.image.url
            }
            for img in obj.images_set.all()
        ]
