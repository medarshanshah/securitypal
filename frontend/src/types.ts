export interface QAPair {
    id: number;
    question: string;
    answer: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface Source {
    question: string;
    answer: string;
    relevance_score: number;
  }
  
  export interface Message {
    text: string;
    isUser: boolean;
  }