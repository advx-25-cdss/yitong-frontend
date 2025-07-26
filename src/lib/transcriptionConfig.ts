// Model configurations for different use cases
export const WHISPER_MODELS = {
  tiny: {
    name: "Xenova/whisper-tiny",
    size: "39MB",
    speed: "Fastest",
    accuracy: "Basic",
    description: "Best for quick testing and low-resource environments",
  },
  small: {
    name: "Xenova/whisper-small",
    size: "244MB",
    speed: "Fast",
    accuracy: "Good",
    description: "Balanced performance - recommended for most use cases",
  },
  base: {
    name: "Xenova/whisper-base",
    size: "142MB",
    speed: "Medium",
    accuracy: "Better",
    description: "Good balance of size and accuracy",
  },
  medium: {
    name: "Xenova/whisper-medium",
    size: "769MB",
    speed: "Slow",
    accuracy: "High",
    description: "High accuracy for production medical environments",
  },
} as const;

export type WhisperModelType = keyof typeof WHISPER_MODELS;

// Configuration for the transcriber
export interface TranscriberConfig {
  model: WhisperModelType;
  enableWebGPU: boolean;
  enableSpeakerDetection: boolean;
  medicalTerminologyMode: boolean;
}

export const DEFAULT_CONFIG: TranscriberConfig = {
  model: "base",
  enableWebGPU: true,
  enableSpeakerDetection: true,
  medicalTerminologyMode: true,
};

// Medical terminology keywords for better speaker detection
export const MEDICAL_KEYWORDS = {
  doctor: [
    "诊断",
    "治疗",
    "药物",
    "检查",
    "建议",
    "医生",
    "处方",
    "症状",
    "病史",
    "检验",
    "化验",
    "手术",
    "康复",
    "复查",
    "用药",
    "剂量",
    "疗程",
    "副作用",
    "禁忌",
    "注意事项",
  ],
  patient: [
    "疼痛",
    "不舒服",
    "症状",
    "感觉",
    "担心",
    "患者",
    "头痛",
    "胸闷",
    "气短",
    "恶心",
    "呕吐",
    "腹痛",
    "发烧",
    "咳嗽",
    "乏力",
    "食欲",
    "睡眠",
    "情绪",
  ],
};

// Utility functions
export function getModelConfig(modelType: WhisperModelType) {
  return WHISPER_MODELS[modelType];
}

export function validateBrowserSupport() {
  const support = {
    webrtc: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    webassembly: typeof WebAssembly === "object",
    webgpu: !!(navigator as any).gpu,
    https:
      typeof window !== "undefined" &&
      (location.protocol === "https:" || location.hostname === "localhost"),
  };

  const issues = [];
  if (!support.webrtc) issues.push("WebRTC (microphone access) not supported");
  if (!support.webassembly) issues.push("WebAssembly not supported");
  if (!support.https) issues.push("HTTPS required for microphone access");

  return {
    supported: issues.length === 0,
    issues,
    features: support,
  };
}

export function estimateModelLoadTime(
  modelType: WhisperModelType,
  connectionSpeed: "slow" | "medium" | "fast" = "medium",
) {
  const sizes = {
    tiny: 39,
    small: 244,
    base: 142,
    medium: 769,
  };

  const speeds = {
    slow: 1, // 1 MB/s
    medium: 5, // 5 MB/s
    fast: 10, // 10 MB/s
  };

  const downloadTime = sizes[modelType] / speeds[connectionSpeed];
  const initTime = 10 + sizes[modelType] / 50; // Rough estimate

  return {
    downloadSeconds: Math.ceil(downloadTime),
    initializationSeconds: Math.ceil(initTime),
    totalSeconds: Math.ceil(downloadTime + initTime),
  };
}
