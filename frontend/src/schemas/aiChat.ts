export interface AiChat {
  uuid: string;
  progress_uuid: string;
  author: "user" | "ai";
  content: string;
  creation_date: string;
}

export interface AiChatCreate {
  progress_uuid: string;
  author: "user" | "ai";
  content: string;
}

export interface AiChatSimpleCreate {
  author: "user" | "ai";
  content: string;
}

export interface AiChatPrompt {
  prompt: string;
}
