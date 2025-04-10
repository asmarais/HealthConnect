import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface ChatMessage {
  content: string;
  sender: 'user' | 'bot';
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit {
  messages: ChatMessage[] = [
    {
      content: 'Bonjour ! Je suis HealthBuddy. Décrivez vos symptômes et je vous orienterai vers le spécialiste approprié.',
      sender: 'bot'
    }
  ];
  userInput: string = '';
  isChatOpen: boolean = false;
  private apiUrl = 'http://127.0.0.1:5001/chat';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
  }

  sendMessage(): void {
    if (!this.userInput.trim()) return;

    // Add user message
    this.messages.push({
      content: this.userInput,
      sender: 'user'
    });

    // Send to API and get response
    this.http.post<any>(this.apiUrl, { message: this.userInput })
      .subscribe({
        next: (data) => {
          this.handleBotResponse(data.response);
        },
        error: (error) => {
          console.error('Erreur:', error);
          this.messages.push({
            content: "Désolé, une erreur s'est produite. Veuillez réessayer.",
            sender: 'bot'
          });
          this.scrollToBottom();
        }
      });

    this.userInput = '';
    this.scrollToBottom();
  }

  private handleBotResponse(response: any): void {
    let responseMessages: string[];

    // Vérifier si la réponse est un tableau
    if (Array.isArray(response)) {
      responseMessages = response;
    }
    // Sinon, si c'est une chaîne, la diviser en messages
    else if (typeof response === 'string') {
      responseMessages = response.split('\n\n').filter(msg => msg.trim());
    }
    // Par défaut, traiter comme un seul message
    else {
      responseMessages = ["Je ne peux pas interpréter cette réponse. Veuillez réessayer."];
    }

    // Nettoyer la réponse : supprimer l'entrée utilisateur si elle est répétée
    responseMessages = responseMessages.filter(msg =>
      msg.trim().toLowerCase() !== this.userInput.trim().toLowerCase()
    );

    // Filtrer les messages pour ne garder que ceux qui sont pertinents
    const filteredMessages = responseMessages.filter(msg =>
      !msg.startsWith('3.') && !msg.startsWith('4.') && !msg.startsWith('5.') ||
      (msg.startsWith('2.') && !msg.includes('(Cette étape sera réalisée une fois que vous aurez décrit vos symptômes.)'))
    );

    // Si aucun message pertinent n'est trouvé, ajouter un message par défaut
    if (filteredMessages.length === 0) {
      filteredMessages.push("Je suis là pour vous aider ! Pouvez-vous me décrire vos symptômes (par exemple, douleur, fatigue, fièvre) afin que je puisse vous orienter au mieux ?");
    }

    // Ajouter chaque message avec un délai
    filteredMessages.forEach((msg, index) => {
      setTimeout(() => {
        this.messages.push({
          content: msg,
          sender: 'bot'
        });
        this.scrollToBottom();
      }, index * 1000); // 1 seconde de délai entre chaque message
    });
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const chatBody = document.getElementById('chat-messages');
      if (chatBody) {
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    }, 0);
  }

  formatMessage(content: string): string {
    // Convertir le gras (**text**) en HTML
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Convertir les sauts de ligne en <br>
    content = content.replace(/\n/g, '<br>');
    return content;
  }
}
