from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from pathlib import Path

# ------------------------
# URLS PRINCIPALES
# ------------------------
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
]

# ------------------------
# MEDIA (uploads utilisateurs) — seulement en dev
# ------------------------
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# ------------------------
# IMAGES REACT BUILD (logo, accueil, etc.)
# Serve frontend/build/images sous /images
# ------------------------
urlpatterns += static('/images/', document_root=Path(settings.BASE_DIR) / 'frontend' / 'build' / 'images')

# ------------------------
# STATIC FILES REACT (CSS/JS)
# ------------------------
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])

# ------------------------
# TOUTES LES AUTRES URL → React index.html
# ------------------------
urlpatterns += [
    re_path(r'^.*$', TemplateView.as_view(template_name="index.html")),
]