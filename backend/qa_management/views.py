from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import QAPair
from .serializers import QAPairSerializer
from sentence_transformers import SentenceTransformer, util
import torch

model = SentenceTransformer('all-MiniLM-L6-v2')

class QAPairViewSet(viewsets.ModelViewSet):
    queryset = QAPair.objects.all()
    serializer_class = QAPairSerializer
    permission_classes = [IsAuthenticated]

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chatbot_response(request):
    user_question = request.data.get('question', '')
    
    user_embedding = model.encode([user_question])[0]
    
    qa_pairs = QAPair.objects.all()
    relevant_pairs = []
    
    for qa_pair in qa_pairs:
        qa_embedding = model.encode([qa_pair.question])[0]
        
        similarity = util.pytorch_cos_sim(torch.tensor([user_embedding]), torch.tensor([qa_embedding]))[0][0].item()
        relevant_pairs.append((qa_pair, similarity))
    
    relevant_pairs.sort(key=lambda x: x[1], reverse=True)
    top_pairs = relevant_pairs[:4]
    
    if top_pairs:
        bot_response = top_pairs[0][0].answer
    else:
        bot_response = "I'm sorry, I couldn't find a relevant answer to your question."
    
    response_data = {
        'answer': bot_response,
        'sources': [
            {
                'question': pair[0].question,
                'answer': pair[0].answer,
                'relevance_score': pair[1]
            } for pair in top_pairs
        ]
    }
    
    return Response(response_data)