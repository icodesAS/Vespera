declare module "@google/genai" {
  type ClientOptions = {
    apiKey?: string;
    project?: string;
    location?: string;
    vertexai?: boolean;
  };

  type GenerationConfig = {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };

  type Part = { text?: string };
  type Content = { role?: string; parts: Part[] };

  type GenerateContentResponse = {
    response?: {
      text(): string;
    };
  };

  interface GenerationResult {
    response?: {
      text?: () => string | undefined;
    };
    text?: () => string | undefined;
  }

  interface GenerativeModel {
    generateContent(
      input: string | Content | Array<string | Content>
    ): Promise<GenerationResult>;
  }

  interface ModelsClient {
    generateContent(options: {
      model: string;
      contents: Array<Content>;
      generationConfig?: GenerationConfig;
    }): Promise<GenerationResult>;
  }

  export class GoogleGenAI {
    constructor(options: ClientOptions);
    readonly models: ModelsClient;
    getGenerativeModel(options: {
      model: string;
      generationConfig?: GenerationConfig;
    }): GenerativeModel;
  }
}

