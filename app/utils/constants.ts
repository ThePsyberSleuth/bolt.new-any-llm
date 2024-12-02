import type { ModelInfo, OllamaApiResponse, OllamaModel, GLHFModel, GLHFApiResponse } from './types';
import type { ProviderInfo } from '~/types/model';

export const WORK_DIR_NAME = 'project';
export const WORK_DIR = `/home/${WORK_DIR_NAME}`;
export const MODIFICATIONS_TAG_NAME = 'bolt_file_modifications';
export const MODEL_REGEX = /^\[Model: (.*?)\]\n\n/;
export const PROVIDER_REGEX = /\[Provider: (.*?)\]\n\n/;
export const DEFAULT_MODEL = 'claude-3-5-sonnet-latest';
export const PROMPT_COOKIE_KEY = 'cachedPrompt';

const PROVIDER_LIST: ProviderInfo[] = [
  {
    name: 'Anthropic',
    staticModels: [
      {
        name: 'claude-3-5-sonnet-latest',
        label: 'Claude 3.5 Sonnet (new)',
        provider: 'Anthropic',
        maxTokenAllowed: 8000,
      },
      {
        name: 'claude-3-5-sonnet-20240620',
        label: 'Claude 3.5 Sonnet (old)',
        provider: 'Anthropic',
        maxTokenAllowed: 8000,
      },
      {
        name: 'claude-3-5-haiku-latest',
        label: 'Claude 3.5 Haiku (new)',
        provider: 'Anthropic',
        maxTokenAllowed: 8000,
      },
      { name: 'claude-3-opus-latest', label: 'Claude 3 Opus', provider: 'Anthropic', maxTokenAllowed: 8000 },
      { name: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet', provider: 'Anthropic', maxTokenAllowed: 8000 },
      { name: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku', provider: 'Anthropic', maxTokenAllowed: 8000 },
    ],
    getApiKeyLink: 'https://console.anthropic.com/settings/keys',
  },
  {
    name: 'Ollama',
    staticModels: [],
    getDynamicModels: getOllamaModels,
    getApiKeyLink: 'https://ollama.com/download',
    labelForGetApiKey: 'Download Ollama',
    icon: 'i-ph:cloud-arrow-down',
  },
  {
    name: 'OpenAILike',
    staticModels: [],
    getDynamicModels: getOpenAILikeModels,
  },
  {
    name: 'Cohere',
    staticModels: [
      { name: 'command-r-plus-08-2024', label: 'Command R plus Latest', provider: 'Cohere', maxTokenAllowed: 4096 },
      { name: 'command-r-08-2024', label: 'Command R Latest', provider: 'Cohere', maxTokenAllowed: 4096 },
      { name: 'command-r-plus', label: 'Command R plus', provider: 'Cohere', maxTokenAllowed: 4096 },
      { name: 'command-r', label: 'Command R', provider: 'Cohere', maxTokenAllowed: 4096 },
      { name: 'command', label: 'Command', provider: 'Cohere', maxTokenAllowed: 4096 },
      { name: 'command-nightly', label: 'Command Nightly', provider: 'Cohere', maxTokenAllowed: 4096 },
      { name: 'command-light', label: 'Command Light', provider: 'Cohere', maxTokenAllowed: 4096 },
      { name: 'command-light-nightly', label: 'Command Light Nightly', provider: 'Cohere', maxTokenAllowed: 4096 },
      { name: 'c4ai-aya-expanse-8b', label: 'c4AI Aya Expanse 8b', provider: 'Cohere', maxTokenAllowed: 4096 },
      { name: 'c4ai-aya-expanse-32b', label: 'c4AI Aya Expanse 32b', provider: 'Cohere', maxTokenAllowed: 4096 },
    ],
    getApiKeyLink: 'https://dashboard.cohere.com/api-keys',
  },
  {
    name: 'OpenRouter',
    staticModels: [
      { name: 'gpt-4o', label: 'GPT-4o', provider: 'OpenAI', maxTokenAllowed: 8000 },
      {
        name: 'anthropic/claude-3.5-sonnet',
        label: 'Anthropic: Claude 3.5 Sonnet (OpenRouter)',
        provider: 'OpenRouter',
        maxTokenAllowed: 8000,
      },
      {
        name: 'anthropic/claude-3-haiku',
        label: 'Anthropic: Claude 3 Haiku (OpenRouter)',
        provider: 'OpenRouter',
        maxTokenAllowed: 8000,
      },
      {
        name: 'deepseek/deepseek-coder',
        label: 'Deepseek-Coder V2 236B (OpenRouter)',
        provider: 'OpenRouter',
        maxTokenAllowed: 8000,
      },
      {
        name: 'google/gemini-flash-1.5',
        label: 'Google Gemini Flash 1.5 (OpenRouter)',
        provider: 'OpenRouter',
        maxTokenAllowed: 8000,
      },
      {
        name: 'google/gemini-pro-1.5',
        label: 'Google Gemini Pro 1.5 (OpenRouter)',
        provider: 'OpenRouter',
        maxTokenAllowed: 8000,
      },
      { name: 'x-ai/grok-beta', label: 'xAI Grok Beta (OpenRouter)', provider: 'OpenRouter', maxTokenAllowed: 8000 },
      {
        name: 'mistralai/mistral-nemo',
        label: 'OpenRouter Mistral Nemo (OpenRouter)',
        provider: 'OpenRouter',
        maxTokenAllowed: 8000,
      },
      {
        name: 'qwen/qwen-110b-chat',
        label: 'OpenRouter Qwen 110b Chat (OpenRouter)',
        provider: 'OpenRouter',
        maxTokenAllowed: 8000,
      },
      { name: 'cohere/command', label: 'Cohere Command (OpenRouter)', provider: 'OpenRouter', maxTokenAllowed: 4096 },
    ],
    getDynamicModels: getOpenRouterModels,
    getApiKeyLink: 'https://openrouter.ai/settings/keys',
  },
  {
    name: 'Google',
    staticModels: [
      { name: 'gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash', provider: 'Google', maxTokenAllowed: 8192 },
      { name: 'gemini-1.5-flash-002', label: 'Gemini 1.5 Flash-002', provider: 'Google', maxTokenAllowed: 8192 },
      { name: 'gemini-1.5-flash-8b', label: 'Gemini 1.5 Flash-8b', provider: 'Google', maxTokenAllowed: 8192 },
      { name: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro', provider: 'Google', maxTokenAllowed: 8192 },
      { name: 'gemini-1.5-pro-002', label: 'Gemini 1.5 Pro-002', provider: 'Google', maxTokenAllowed: 8192 },
      { name: 'gemini-exp-1121', label: 'Gemini exp-1121', provider: 'Google', maxTokenAllowed: 8192 },
    ],
    getApiKeyLink: 'https://aistudio.google.com/app/apikey',
  },
  {
    name: 'Groq',
    staticModels: [
      { name: 'llama-3.1-70b-versatile', label: 'Llama 3.1 70b (Groq)', provider: 'Groq', maxTokenAllowed: 8000 },
      { name: 'llama-3.1-8b-instant', label: 'Llama 3.1 8b (Groq)', provider: 'Groq', maxTokenAllowed: 8000 },
      { name: 'llama-3.2-11b-vision-preview', label: 'Llama 3.2 11b (Groq)', provider: 'Groq', maxTokenAllowed: 8000 },
      { name: 'llama-3.2-3b-preview', label: 'Llama 3.2 3b (Groq)', provider: 'Groq', maxTokenAllowed: 8000 },
      { name: 'llama-3.2-1b-preview', label: 'Llama 3.2 1b (Groq)', provider: 'Groq', maxTokenAllowed: 8000 },
    ],
    getApiKeyLink: 'https://console.groq.com/keys',
  },
  {
    name: 'HuggingFace',
    staticModels: [
      {
        name: 'Qwen/Qwen2.5-Coder-32B-Instruct',
        label: 'Qwen2.5-Coder-32B-Instruct (HuggingFace)',
        provider: 'HuggingFace',
        maxTokenAllowed: 8000,
      },
      {
        name: '01-ai/Yi-1.5-34B-Chat',
        label: 'Yi-1.5-34B-Chat (HuggingFace)',
        provider: 'HuggingFace',
        maxTokenAllowed: 8000,
      },
      {
        name: 'codellama/CodeLlama-34b-Instruct-hf',
        label: 'CodeLlama-34b-Instruct (HuggingFace)',
        provider: 'HuggingFace',
        maxTokenAllowed: 8000,
      },
      {
        name: 'NousResearch/Hermes-3-Llama-3.1-8B',
        label: 'Hermes-3-Llama-3.1-8B (HuggingFace)',
        provider: 'HuggingFace',
        maxTokenAllowed: 8000,
      },
      {
        name: 'Qwen/Qwen2.5-Coder-32B-Instruct',
        label: 'Qwen2.5-Coder-32B-Instruct (HuggingFace)',
        provider: 'HuggingFace',
        maxTokenAllowed: 8000,
      },
      {
        name: 'Qwen/Qwen2.5-72B-Instruct',
        label: 'Qwen2.5-72B-Instruct (HuggingFace)',
        provider: 'HuggingFace',
        maxTokenAllowed: 8000,
      },
      {
        name: 'meta-llama/Llama-3.1-70B-Instruct',
        label: 'Llama-3.1-70B-Instruct (HuggingFace)',
        provider: 'HuggingFace',
        maxTokenAllowed: 8000,
      },
      {
        name: 'meta-llama/Llama-3.1-405B',
        label: 'Llama-3.1-405B (HuggingFace)',
        provider: 'HuggingFace',
        maxTokenAllowed: 8000,
      },
      {
        name: '01-ai/Yi-1.5-34B-Chat',
        label: 'Yi-1.5-34B-Chat (HuggingFace)',
        provider: 'HuggingFace',
        maxTokenAllowed: 8000,
      },
      {
        name: 'codellama/CodeLlama-34b-Instruct-hf',
        label: 'CodeLlama-34b-Instruct (HuggingFace)',
        provider: 'HuggingFace',
        maxTokenAllowed: 8000,
      },
      {
        name: 'NousResearch/Hermes-3-Llama-3.1-8B',
        label: 'Hermes-3-Llama-3.1-8B (HuggingFace)',
        provider: 'HuggingFace',
        maxTokenAllowed: 8000,
      },
    ],
    getApiKeyLink: 'https://huggingface.co/settings/tokens',
  },

  {
    name: 'OpenAI',
    staticModels: [
      { name: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'OpenAI', maxTokenAllowed: 8000 },
      { name: 'gpt-4-turbo', label: 'GPT-4 Turbo', provider: 'OpenAI', maxTokenAllowed: 8000 },
      { name: 'gpt-4', label: 'GPT-4', provider: 'OpenAI', maxTokenAllowed: 8000 },
      { name: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', provider: 'OpenAI', maxTokenAllowed: 8000 },
    ],
    getApiKeyLink: 'https://platform.openai.com/api-keys',
  },
  {
    name: 'xAI',
    staticModels: [{ name: 'grok-beta', label: 'xAI Grok Beta', provider: 'xAI', maxTokenAllowed: 8000 }],
    getApiKeyLink: 'https://docs.x.ai/docs/quickstart#creating-an-api-key',
  },
  {
    name: 'Deepseek',
    staticModels: [
      { name: 'deepseek-coder', label: 'Deepseek-Coder', provider: 'Deepseek', maxTokenAllowed: 8000 },
      { name: 'deepseek-chat', label: 'Deepseek-Chat', provider: 'Deepseek', maxTokenAllowed: 8000 },
    ],
    getApiKeyLink: 'https://platform.deepseek.com/apiKeys',
  },
  {
    name: 'Mistral',
    staticModels: [
      { name: 'open-mistral-7b', label: 'Mistral 7B', provider: 'Mistral', maxTokenAllowed: 8000 },
      { name: 'open-mixtral-8x7b', label: 'Mistral 8x7B', provider: 'Mistral', maxTokenAllowed: 8000 },
      { name: 'open-mixtral-8x22b', label: 'Mistral 8x22B', provider: 'Mistral', maxTokenAllowed: 8000 },
      { name: 'open-codestral-mamba', label: 'Codestral Mamba', provider: 'Mistral', maxTokenAllowed: 8000 },
      { name: 'open-mistral-nemo', label: 'Mistral Nemo', provider: 'Mistral', maxTokenAllowed: 8000 },
      { name: 'ministral-8b-latest', label: 'Mistral 8B', provider: 'Mistral', maxTokenAllowed: 8000 },
      { name: 'mistral-small-latest', label: 'Mistral Small', provider: 'Mistral', maxTokenAllowed: 8000 },
      { name: 'codestral-latest', label: 'Codestral', provider: 'Mistral', maxTokenAllowed: 8000 },
      { name: 'mistral-large-latest', label: 'Mistral Large Latest', provider: 'Mistral', maxTokenAllowed: 8000 },
    ],
    getApiKeyLink: 'https://console.mistral.ai/api-keys/',
  },
  {
    name: 'LMStudio',
    staticModels: [],
    getDynamicModels: getLMStudioModels,
    getApiKeyLink: 'https://lmstudio.ai/',
    labelForGetApiKey: 'Get LMStudio',
    icon: 'i-ph:cloud-arrow-down',
  },
  {
    name: 'GitHub Models',
    staticModels: [
      {
        name: 'o1-preview',
        label: 'O1 Preview',
        provider: 'GitHub Models',
        maxTokenAllowed: 8000,
      },
      {
        name: 'o1-mini',
        label: 'O1 Mini',
        provider: 'GitHub Models',
        maxTokenAllowed: 8000,
      },
      {
        name: 'gpt-4o',
        label: 'GPT-4O',
        provider: 'GitHub Models',
        maxTokenAllowed: 8000,
      },
      {
        name: 'gpt-4o-mini',
        label: 'GPT-4O Mini',
        provider: 'GitHub Models',
        maxTokenAllowed: 8000,
      },
      {
        name: 'meta-llama-3.1-405b-instruct',
        label: 'Meta Llama 3.1 405B Instruct',
        provider: 'GitHub Models',
        maxTokenAllowed: 8000,
      },
      {
        name: 'meta-llama-3.1-70b-instruct',
        label: 'Meta Llama 3.1 70B Instruct',
        provider: 'GitHub Models',
        maxTokenAllowed: 8000,
      },
      {
        name: 'meta-llama-3.1-8b-instruct',
        label: 'Meta Llama 3.1 8B Instruct',
        provider: 'GitHub Models',
        maxTokenAllowed: 8000,
      },
      {
        name: 'llama-3.2-90b-vision-instruct',
        label: 'Llama 3.2 90B Vision Instruct',
        provider: 'GitHub Models',
        maxTokenAllowed: 8000,
      },
      {
        name: 'llama-3.2-11b-vision-instruct',
        label: 'Llama 3.2 11B Vision Instruct',
        provider: 'GitHub Models',
        maxTokenAllowed: 8000,
      },
      {
        name: 'mistral-large-2407',
        label: 'Mistral Large 2407',
        provider: 'GitHub Models',
        maxTokenAllowed: 8000,
      },
      {
        name: 'mistral-large',
        label: 'Mistral Large',
        provider: 'GitHub Models',
        maxTokenAllowed: 8000,
      },
      {
        name: 'mistral-small',
        label: 'Mistral Small',
        provider: 'GitHub Models',
        maxTokenAllowed: 8000,
      },
      {
        name: 'mistral-nemo',
        label: 'Mistral Nemo',
        provider: 'GitHub Models',
        maxTokenAllowed: 8000,
      },
      {
        name: 'ministral-3B',
        label: 'Mistral: Ministral 3B',
        provider: 'GitHub Models',
        maxTokenAllowed: 8000,
      },
      {
        name: 'cohere-command-r-08-2024',
        label: 'Cohere Command R 08-2024',
        provider: 'GitHub Models',
        maxTokenAllowed: 8000,
      },
      {
        name: 'cohere-command-r',
        label: 'Cohere Command R',
        provider: 'GitHub Models',
        maxTokenAllowed: 8000,
      },
      {
        name: 'cohere-command-r-plus-08-2024',
        label: 'Cohere Command R+ 08-2024',
        provider: 'GitHub Models',
        maxTokenAllowed: 8000,
      },
      {
        name: 'cohere-command-r-plus',
        label: 'Cohere Command R+',
        provider: 'GitHub Models',
        maxTokenAllowed: 8000,
      },
      {
        name: 'phi-3.5-moe-instruct',
        label: 'Phi 3.5 MoE Instruct',
        provider: 'GitHub Models',
        maxTokenAllowed: 8000,
      },
      {
        name: 'phi-3.5-vision-instruct',
        label: 'Phi 3.5 Vision Instruct',
        provider: 'GitHub Models',
        maxTokenAllowed: 8000,
      },
      {
        name: 'phi-3.5-mini-instruct',
        label: 'Phi-3.5-mini instruct (128k)',
        provider: 'GitHub Models',
        maxTokenAllowed: 8000,
      },
      {
        name: 'phi-3-medium-128k-instruct',
        label: 'Phi-3-medium instruct (128k)',
        provider: 'GitHub Models',
        maxTokenAllowed: 8000,
      },
      {
        name: 'phi-3-medium-4k-instruct',
        label: 'Phi-3-medium instruct (4k)',
        provider: 'GitHub Models',
        maxTokenAllowed: 8000,
      },
      {
        name: 'phi-3-mini-128k-instruct',
        label: 'Phi-3-mini instruct (128k)',
        provider: 'GitHub Models',
        maxTokenAllowed: 8000,
      },
      {
        name: 'phi-3-mini-4k-instruct',
        label: 'Phi-3-mini instruct (4k)',
        provider: 'GitHub Models',
        maxTokenAllowed: 8000,
      },
      {
        name: 'phi-3-small-128k-instruct',
        label: 'Phi-3-small instruct (128k)',
        provider: 'GitHub Models',
        maxTokenAllowed: 8000,
      },
      {
        name: 'phi-3-small-8k-instruct',
        label: 'Phi-3-small instruct (8k)',
        provider: 'GitHub Models',
        maxTokenAllowed: 8000,
      },
    ],
    getApiKeyLink: 'https://github.com/settings/tokens',
    labelForGetApiKey: 'Get GitHub API Token',
  },
  {
    name: 'GLHF Models',
    staticModels: [],
    getDynamicModels: getGLHFModels,
    getApiKeyLink: 'https://glhf.chat/users/settings/api',
    labelForGetApiKey: 'Get GLHF API Key',
  },
  {
    name: 'Together',
    staticModels: [
      {
        name: 'Qwen/Qwen2.5-Coder-32B-Instruct',
        label: 'Qwen/Qwen2.5-Coder-32B-Instruct',
        provider: 'Together',
        maxTokenAllowed: 8000,
      },
      {
        name: 'meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo',
        label: 'meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo',
        provider: 'Together',
        maxTokenAllowed: 8000,
      },

      {
        name: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        label: 'Mixtral 8x7B Instruct',
        provider: 'Together',
        maxTokenAllowed: 8192,
      },
    ],
    getApiKeyLink: 'https://api.together.xyz/settings/api-keys',
  },
];

export const DEFAULT_PROVIDER = PROVIDER_LIST[0];

const staticModels: ModelInfo[] = PROVIDER_LIST.map((p) => p.staticModels).flat();

export let MODEL_LIST: ModelInfo[] = [...staticModels];

const getOllamaBaseUrl = () => {
  const defaultBaseUrl = import.meta.env.OLLAMA_API_BASE_URL || 'http://localhost:11434';

  // Check if we're in the browser
  if (typeof window !== 'undefined') {
    // Frontend always uses localhost
    return defaultBaseUrl;
  }

  // Backend: Check if we're running in Docker
  const isDocker = process.env.RUNNING_IN_DOCKER === 'true';

  return isDocker ? defaultBaseUrl.replace('localhost', 'host.docker.internal') : defaultBaseUrl;
};

async function getOllamaModels(): Promise<ModelInfo[]> {
  try {
    const response = await fetch(`${getOllamaBaseUrl()}/api/tags`);

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as OllamaApiResponse;

    return data.models.map((model: OllamaModel) => ({
      name: model.name,
      label: `${model.name} (${model.details.parameter_size})`,
      provider: 'Ollama',
      maxTokenAllowed: 8000,
    }));
  } catch (e) {
    console.error('Error getting Ollama models:', e);
    return [];
  }
}

async function getOpenAILikeModels(): Promise<ModelInfo[]> {
  try {
    const baseUrl = import.meta.env.OPENAI_LIKE_API_BASE_URL || '';

    if (!baseUrl) {
      return [];
    }

    const apiKey = import.meta.env.OPENAI_LIKE_API_KEY ?? '';
    const response = await fetch(`${baseUrl}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    const res = (await response.json()) as any;

    return res.data.map((model: any) => ({
      name: model.id,
      label: model.id,
      provider: 'OpenAILike',
    }));
  } catch (e) {
    console.error('Error getting OpenAILike models:', e);
    return [];
  }
}

type OpenRouterModelsResponse = {
  data: {
    name: string;
    id: string;
    context_length: number;
    pricing: {
      prompt: number;
      completion: number;
    };
  }[];
};

async function getOpenRouterModels(): Promise<ModelInfo[]> {
  const data: OpenRouterModelsResponse = await (
    await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  ).json();

  return data.data
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((m) => ({
      name: m.id,
      label: `${m.name} - in:$${(m.pricing.prompt * 1_000_000).toFixed(
        2,
      )} out:$${(m.pricing.completion * 1_000_000).toFixed(2)} - context ${Math.floor(m.context_length / 1000)}k`,
      provider: 'OpenRouter',
      maxTokenAllowed: 8000,
    }));
}

async function getLMStudioModels(): Promise<ModelInfo[]> {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const baseUrl = import.meta.env.LMSTUDIO_API_BASE_URL || 'http://localhost:1234';
    const response = await fetch(`${baseUrl}/v1/models`);
    const data = (await response.json()) as any;

    return data.data.map((model: any) => ({
      name: model.id,
      label: model.id,
      provider: 'LMStudio',
    }));
  } catch (e) {
    console.error('Error getting LMStudio models:', e);
    return [];
  }
}

function formatModelLabel(id: string): string {
  // Remove 'hf:' prefix and split into parts
  const parts = id.replace('hf:', '').split('/');

  if (parts.length < 2) {
    return id;
  }

  const org = parts[0];
  const modelName = parts[1];

  // Format organization name using common patterns
  const orgDisplay = org
    .split(/[-_]/)
    .map((part) => {
      // Handle common abbreviations and special cases
      const lowerPart = part.toLowerCase();

      if (/^[A-Z]+$/i.test(part)) {
        return part.toUpperCase();
      }

      if (['ai', 'aidc'].includes(lowerPart)) {
        return part.toUpperCase();
      }

      if (part.match(/^v\d/i)) {
        return part.toLowerCase();
      }

      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join(' ');

  // Extract all components using regex patterns
  const patterns = {
    size: /(\d+(?:\.\d+)?(?:x\d+)?[BM])\b/i,
    version: /[-.]v(\d+(?:\.\d+)?(?:\.\d+)?)/i,
    flags: /[-_]([A-Z]{2,4})(?:[-_]|$)/gi,
    suffixes: /(instruct|vision)/gi,
  };

  // Extract components
  const size = modelName.match(patterns.size);
  const sizeStr = size ? ` (${size[0].toUpperCase()})` : '';

  const version = modelName.match(patterns.version);
  const versionStr = version ? ` (v${version[1]})` : '';

  // Collect all flags
  const flags = new Set();
  let flagMatch;

  while ((flagMatch = patterns.flags.exec(modelName)) !== null) {
    const flag = flagMatch[1].toUpperCase();

    if (['IT', 'DPO'].includes(flag)) {
      flags.add(flag);
    }
  }

  const flagsStr = flags.size ? ` (${Array.from(flags).join(') (')})` : '';

  // Clean up model name
  let cleanName = modelName
    // Remove all extracted components
    .replace(patterns.size, '')
    .replace(patterns.version, '')
    .replace(patterns.flags, '')
    // Remove suffixes first
    .replace(/\b(instruct|vision)\b/gi, '')
    // Handle special formatting
    .replace(/[-_]/g, ' ') // Convert separators to spaces
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
    .replace(/\s+/g, ' ') // Clean up extra spaces
    .trim();

  // Remove organization prefix if present
  const orgLower = org.toLowerCase();

  if (cleanName.toLowerCase().startsWith(orgLower)) {
    cleanName = cleanName.substring(orgLower.length).trim();
  }

  // Define and apply model-specific patterns
  const modelPatterns = {
    llama: /\b(llama)\s*(\d+(?:\.\d+)?)/i,
    qwen: /\b(qwen)\s*(\d+(?:\.\d+)?)/i,
    gemma: /\b(gemma)\s*(\d+(?:\.\d+)?)/i,
    mixtral: /\b(mixtral)\s*(\d+(?:\.\d+)?)?/i,
    nous: /\b(nous)\s*(hermes)/i,
  };

  // Apply model-specific formatting
  Object.entries(modelPatterns).forEach(([_model, pattern]) => {
    cleanName = cleanName.replace(pattern, (_, name, version) => {
      name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      return version ? `${name}${version}` : name;
    });
  });

  // Handle special cases
  cleanName = cleanName
    .replace(/\bo ?1\b/i, 'o1')
    .replace(/(\w+)\s+(\d)/g, '$1$2') // Join any remaining model name with numbers
    .trim();

  // Add suffixes in correct order
  const suffixes = new Set();
  let suffixMatch;

  while ((suffixMatch = patterns.suffixes.exec(modelName)) !== null) {
    suffixes.add(suffixMatch[1].charAt(0).toUpperCase() + suffixMatch[1].slice(1).toLowerCase());
  }

  if (suffixes.has('Vision') && suffixes.has('Instruct')) {
    cleanName = `${cleanName} Vision Instruct`;
  } else if (suffixes.has('Instruct')) {
    cleanName = `${cleanName} Instruct`;
  }

  return `${orgDisplay}: ${cleanName}${sizeStr}${versionStr}${flagsStr}`.trim();
}

async function getGLHFModels(): Promise<ModelInfo[]> {
  try {
    const apiKey = import.meta.env.GLHF_API_KEY ?? '';

    if (!apiKey) {
      console.error('GLHF_API_KEY is not set in environment variables');
      return [];
    }

    const response = await fetch('https://glhf.chat/api/openai/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch GLHF models:', response.statusText);
      return [];
    }

    const { data }: GLHFApiResponse = await response.json();

    return data.map((model: GLHFModel) => ({
      name: model.id,
      label: formatModelLabel(model.id),
      provider: 'GLHF Models',
      maxTokenAllowed: 8192, // Default context window, adjust if needed
    }));
  } catch (error) {
    console.error('Error fetching GLHF models:', error);
    return [];
  }
}

async function initializeModelList(): Promise<ModelInfo[]> {
  MODEL_LIST = [
    ...(
      await Promise.all(
        PROVIDER_LIST.filter(
          (p): p is ProviderInfo & { getDynamicModels: () => Promise<ModelInfo[]> } => !!p.getDynamicModels,
        ).map((p) => p.getDynamicModels()),
      )
    ).flat(),
    ...staticModels,
  ];
  return MODEL_LIST;
}

export {
  getOllamaModels,
  getOpenAILikeModels,
  getLMStudioModels,
  initializeModelList,
  getOpenRouterModels,
  getGLHFModels,
  PROVIDER_LIST,
};
