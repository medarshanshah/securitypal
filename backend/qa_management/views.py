from rest_framework import viewsets, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import QAPair
from .serializers import QAPairSerializer
from sentence_transformers import SentenceTransformer
import numpy as np
from django.db.models import Q

# Load the sentence transformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

class QAPairViewSet(viewsets.ModelViewSet):
    queryset = QAPair.objects.all()
    serializer_class = QAPairSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['question', 'answer']

@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key})
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chatbot_response(request):
    user_question = request.data.get('question', '')
    
    # Encode the user question
    user_embedding = model.encode([user_question])[0]
    
    # Find relevant Q&A pairs
    qa_pairs = QAPair.objects.all()
    relevant_pairs = []
    
    for qa_pair in qa_pairs:
        qa_embedding = model.encode([qa_pair.question])[0]
        
        # Calculate cosine similarity
        similarity = np.dot(user_embedding, qa_embedding) / (np.linalg.norm(user_embedding) * np.linalg.norm(qa_embedding))
        relevant_pairs.append((qa_pair, similarity))
    
    # Sort by similarity score and get top 4
    relevant_pairs.sort(key=lambda x: x[1], reverse=True)
    top_pairs = relevant_pairs[:4]
    
    # Get the most relevant answer
    if top_pairs:
        bot_response = top_pairs[0][0].answer
    else:
        bot_response = "I'm sorry, I couldn't find a relevant answer to your question."
    
    # Prepare the response
    response_data = {
        'answer': bot_response,
        'sources': [
            {
                'question': pair[0].question,
                'answer': pair[0].answer,
                'relevance_score': float(pair[1])
            } for pair in top_pairs
        ]
    }
    
    return Response(response_data)