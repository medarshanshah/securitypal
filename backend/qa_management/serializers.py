from rest_framework import serializers
from .models import QAPair

class QAPairSerializer(serializers.ModelSerializer):
    class Meta:
        model = QAPair
        fields = ['id', 'question', 'answer', 'created_at', 'updated_at']