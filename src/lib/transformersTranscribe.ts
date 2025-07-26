import { pipeline } from "@huggingface/transformers";
import {
  type TranscriberConfig,
  DEFAULT_CONFIG,
  MEDICAL_KEYWORDS,
  getModelConfig,
  validateBrowserSupport,
} from "./transcriptionConfig";

export interface TranscriptionSegment {
  id: string;
  speaker: "doctor" | "patient";
  text: string;
  timestamp: string;
  startTime: number;
  endTime: number;
}

export class TransformersAudioTranscriber {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isTranscribing: boolean = false;
  private transcriber: any = null;
  private onTranscriptionUpdate:
    | ((segments: TranscriptionSegment[]) => void)
    | null = null;
  private currentSegments: TranscriptionSegment[] = [];
  private segmentIdCounter = 0;
  private recordingStartTime = 0;
  private config: TranscriberConfig;

  constructor(config: Partial<TranscriberConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeTranscriber();
  }

  private async initializeTranscriber() {
    // Validate browser support first
    const browserSupport = validateBrowserSupport();
    if (!browserSupport.supported) {
      console.error("Browser not supported:", browserSupport.issues);
      return;
    }

    try {
      const modelConfig = getModelConfig(this.config.model);
      console.log(`Initializing ${modelConfig.name} (${modelConfig.size})...`);

      // Try WebGPU first if enabled and supported
      if (this.config.enableWebGPU && browserSupport.features.webgpu) {
        this.transcriber = await pipeline(
          "automatic-speech-recognition",
          modelConfig.name,
          {
            device: "webgpu",
            dtype: "fp32",
          },
        );
        console.log(
          "Transformers.js transcriber initialized with WebGPU acceleration",
        );
      } else {
        throw new Error("WebGPU not available, trying CPU");
      }
    } catch (error) {
      console.warn("WebGPU not available, falling back to CPU");
      try {
        const modelConfig = getModelConfig(this.config.model);
        this.transcriber = await pipeline(
          "automatic-speech-recognition",
          modelConfig.name,
          {
            device: "cpu",
            dtype: "fp32",
          },
        );
        console.log("Transformers.js transcriber initialized on CPU");
      } catch (cpuError) {
        console.error("Failed to initialize transcriber:", cpuError);
      }
    }
  }

  setOnTranscriptionUpdate(
    callback: (segments: TranscriptionSegment[]) => void,
  ) {
    this.onTranscriptionUpdate = callback;
  }

  private async processCompleteAudio(audioBlob: Blob) {
    if (!this.transcriber) {
      console.warn("Transcriber not initialized yet");
      return;
    }

    try {
      console.log("Processing complete audio recording...");

      // Create audio context to process the audio
      const audioContext = new AudioContext({
        sampleRate: 16000, // Ensure consistent sample rate
      });
      const audioBuffer = await audioContext.decodeAudioData(
        await audioBlob.arrayBuffer(),
      );

      // Get audio data as Float32Array (required by transformers.js)
      const audioData = audioBuffer.getChannelData(0);

      // Perform transcription on the complete audio
      const result: any = await this.transcriber(audioData, {
        task: "transcribe",
        language: "chinese",
        return_timestamps: true,
        initial_prompt: "以下是医生和患者的对话，请进行转录和说话人识别。",
      });

      // Process the complete transcription result
      if (result.text && result.text.trim()) {
        const currentTime = Date.now();
        const totalDuration = (currentTime - this.recordingStartTime) / 1000;

        // Create a single segment for the entire transcription
        const completeSegment: TranscriptionSegment = {
          id: `segment-${this.segmentIdCounter++}`,
          speaker: this.inferSpeaker(result.text),
          text: result.text.trim(),
          timestamp: new Date(currentTime).toLocaleTimeString("zh-CN"),
          startTime: 0,
          endTime: totalDuration,
        };

        // Replace all segments with the complete transcription
        this.currentSegments = [completeSegment];

        // Notify listeners
        if (this.onTranscriptionUpdate) {
          this.onTranscriptionUpdate([...this.currentSegments]);
        }

        console.log("Complete transcription processed:", result.text.trim());
      }
    } catch (error) {
      console.error("Error processing complete audio:", error);
    }
  }

  // Enhanced speaker detection using medical terminology
  private inferSpeaker(text: string): "doctor" | "patient" {
    if (!this.config.enableSpeakerDetection) {
      // Simple alternating if speaker detection is disabled
      return this.currentSegments.length % 2 === 0 ? "doctor" : "patient";
    }

    const lowerText = text.toLowerCase();

    let doctorScore = 0;
    let patientScore = 0;

    // Use medical keywords for more accurate detection
    const doctorKeywords = this.config.medicalTerminologyMode
      ? MEDICAL_KEYWORDS.doctor
      : ["诊断", "治疗", "药物", "检查", "建议", "医生", "处方"];

    const patientKeywords = this.config.medicalTerminologyMode
      ? MEDICAL_KEYWORDS.patient
      : ["疼痛", "不舒服", "症状", "感觉", "担心", "患者"];

    doctorKeywords.forEach((keyword) => {
      if (lowerText.includes(keyword)) doctorScore++;
    });

    patientKeywords.forEach((keyword) => {
      if (lowerText.includes(keyword)) patientScore++;
    });

    // If no clear indication, alternate between speakers
    if (doctorScore === patientScore) {
      return this.currentSegments.length % 2 === 0 ? "doctor" : "patient";
    }

    return doctorScore > patientScore ? "doctor" : "patient";
  }

  async startTranscription(): Promise<void> {
    if (this.isTranscribing) return;

    this.isTranscribing = true;
    this.recordingStartTime = Date.now();
    this.currentSegments = [];
    this.segmentIdCounter = 0;

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000, // Optimal for speech recognition
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType: "audio/webm;codecs=opus",
      });

      this.audioChunks = [];

      // Simply accumulate audio chunks without processing
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Don't process until recording is stopped
      this.mediaRecorder.onstop = () => {
        console.log(
          "Recording stopped, audio chunks accumulated for final processing",
        );
      };

      // Start recording with 1-second chunks for smooth accumulation
      this.mediaRecorder.start(1000);
      console.log(
        "Started client-side audio recording (no real-time processing)",
      );
    } catch (error) {
      console.error("Error starting transcription:", error);
      this.isTranscribing = false;
    }
  }

  stopTranscription(): void {
    if (!this.isTranscribing) return;

    console.log(
      "Stopping client-side transcription and processing complete audio...",
    );
    this.isTranscribing = false;

    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    // Process the complete accumulated audio
    if (this.audioChunks.length > 0) {
      const completeAudioBlob = new Blob(this.audioChunks, {
        type: "audio/webm",
      });
      this.processCompleteAudio(completeAudioBlob);
      this.audioChunks = []; // Clear chunks after processing
    } else {
      console.log("No audio chunks to process");
    }
  }

  getTranscriptionSegments(): TranscriptionSegment[] {
    return [...this.currentSegments];
  }

  clearTranscription(): void {
    this.currentSegments = [];
    this.segmentIdCounter = 0;
  }

  isCurrentlyTranscribing(): boolean {
    return this.isTranscribing;
  }

  terminate(): void {
    this.stopTranscription();
    this.transcriber = null;
  }
}
