from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import QAPair

# Create your tests here.
class SecurityPalTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.client.force_authenticate(user=self.user)
        self.qa_pair = QAPair.objects.create(question='Test question', answer='Test answer')

    def test_login(self):
        response = self.client.post('/api/login/', {'username': 'testuser', 'password': 'testpass'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_chatbot_response(self):
        response = self.client.post('/api/chatbot/', {'question': 'Test question'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('answer', response.data)
        self.assertIn('sources', response.data)

    def test_qa_pair_list(self):
        response = self.client.get('/api/qa-pairs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_qa_pair_create(self):
        data = {'question': 'New question', 'answer': 'New answer'}
        response = self.client.post('/api/qa-pairs/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(QAPair.objects.count(), 2)

    def test_qa_pair_update(self):
        data = {'question': 'Updated question', 'answer': 'Updated answer'}
        response = self.client.put(f'/api/qa-pairs/{self.qa_pair.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.qa_pair.refresh_from_db()
        self.assertEqual(self.qa_pair.question, 'Updated question')

    def test_qa_pair_delete(self):
        response = self.client.delete(f'/api/qa-pairs/{self.qa_pair.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(QAPair.objects.count(), 0)

    def test_unauthorized_access(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/qa-pairs/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)