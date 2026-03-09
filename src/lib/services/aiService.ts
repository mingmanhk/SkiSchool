// AiService: AI abstraction using site-level keys (platform-owned)
import OpenAI from 'openai'

export type AiProvider = 'gemini' | 'openai' | 'deepseek'
export type AiModel = string

export interface AiCompletionOptions {
  model?: AiModel
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

export interface AiCompletionResponse {
  content: string
  model: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export class AiService {
  private getApiKey(provider: AiProvider): string {
    const keys: Record<AiProvider, string | undefined> = {
      gemini: process.env.GEMINI_API_KEY,
      openai: process.env.OPENAI_API_KEY,
      deepseek: process.env.DEEPSEEK_API_KEY,
    }
    const key = keys[provider]
    if (!key) throw new Error(`API key not configured for provider: ${provider}`)
    return key
  }

  async generateCompletion(
    _tenantId: string, // Reserved for metering/analytics
    provider: AiProvider,
    prompt: string,
    options?: AiCompletionOptions,
  ): Promise<AiCompletionResponse> {
    switch (provider) {
      case 'openai':
        return this.generateOpenAI(this.getApiKey('openai'), prompt, options)
      case 'gemini':
        return this.generateGemini(this.getApiKey('gemini'), prompt, options)
      case 'deepseek':
        return this.generateDeepSeek(this.getApiKey('deepseek'), prompt, options)
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }
  }

  private async generateOpenAI(
    apiKey: string,
    prompt: string,
    options?: AiCompletionOptions,
  ): Promise<AiCompletionResponse> {
    const client = new OpenAI({ apiKey })
    const model = options?.model ?? 'gpt-4o-mini'

    const response = await client.chat.completions.create({
      model,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1024,
      messages: [
        ...(options?.systemPrompt
          ? [{ role: 'system' as const, content: options.systemPrompt }]
          : []),
        { role: 'user' as const, content: prompt },
      ],
    })

    const choice = response.choices[0]
    return {
      content: choice.message.content ?? '',
      model: response.model,
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
    }
  }

  private async generateGemini(
    apiKey: string,
    prompt: string,
    options?: AiCompletionOptions,
  ): Promise<AiCompletionResponse> {
    // Gemini via OpenAI-compatible endpoint
    const client = new OpenAI({
      apiKey,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    })
    const model = options?.model ?? 'gemini-2.0-flash'

    const response = await client.chat.completions.create({
      model,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1024,
      messages: [
        ...(options?.systemPrompt
          ? [{ role: 'system' as const, content: options.systemPrompt }]
          : []),
        { role: 'user' as const, content: prompt },
      ],
    })

    const choice = response.choices[0]
    return {
      content: choice.message.content ?? '',
      model: response.model,
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
    }
  }

  private async generateDeepSeek(
    apiKey: string,
    prompt: string,
    options?: AiCompletionOptions,
  ): Promise<AiCompletionResponse> {
    // DeepSeek via OpenAI-compatible endpoint
    const client = new OpenAI({
      apiKey,
      baseURL: 'https://api.deepseek.com',
    })
    const model = options?.model ?? 'deepseek-chat'

    const response = await client.chat.completions.create({
      model,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1024,
      messages: [
        ...(options?.systemPrompt
          ? [{ role: 'system' as const, content: options.systemPrompt }]
          : []),
        { role: 'user' as const, content: prompt },
      ],
    })

    const choice = response.choices[0]
    return {
      content: choice.message.content ?? '',
      model: response.model,
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
    }
  }

  async generateJSON<T>(
    tenantId: string,
    provider: AiProvider,
    prompt: string,
    options?: AiCompletionOptions,
  ): Promise<T> {
    const response = await this.generateCompletion(tenantId, provider, prompt, {
      ...options,
      systemPrompt:
        options?.systemPrompt ??
        'You are a helpful assistant. Always respond with valid JSON only, no markdown.',
    })
    // Strip markdown code fences if present
    const clean = response.content.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    try {
      return JSON.parse(clean) as T
    } catch {
      throw new Error(`Failed to parse JSON response: ${response.content}`)
    }
  }
}
