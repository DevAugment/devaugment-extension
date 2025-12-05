export interface GenerateOptions {
    model: string;
    prompt: string;
    temperature?: number;
    maxTokens?: number;
}


export interface ProviderInterface {
    defaultModel: string;
    generate(options: GenerateOptions): Promise<string>;
}


export function timeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}