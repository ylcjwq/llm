import { ChatOpenAI } from '@langchain/openai';
import {
  loadLangChainConfig,
  getApiKeys,
} from '../config/load-langchain-config';

/**
 * 统一模型工厂：从 YAML 读取模型参数，从环境变量读取令牌和 baseURL
 */
export function createChatModel(): ChatOpenAI {
  const config = loadLangChainConfig();
  const apiKeys = getApiKeys();

  if (!apiKeys.openaiApiKey) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }

  return new ChatOpenAI({
    model: config.llm.model,
    temperature: config.llm.temperature,
    maxTokens: config.llm.maxTokens,
    openAIApiKey: apiKeys.openaiApiKey,
    configuration: {
      baseURL: apiKeys.openaiBaseUrl,
    },
  });
}
