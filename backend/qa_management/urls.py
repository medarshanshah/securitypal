from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QAPairViewSet, chatbot_response

router = DefaultRouter()
router.register(r'qa-pairs', QAPairViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('chatbot/', chatbot_response, name='chatbot_response'),
]