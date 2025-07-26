# Transformers.js Integration for Speech Recognition

This project now uses client-side speech recognition powered by Transformers.js instead of sending audio data to a backend server.

## Overview

The `TransformersAudioTranscriber` class provides real-time speech-to-text functionality running entirely in the browser using:

- **Transformers.js**: Hugging Face's client-side ML library
- **Whisper Model**: Small multilingual speech recognition model (Xenova/whisper-small)
- **WebGPU/CPU**: Hardware acceleration when available

## Features

✅ **Client-side Processing**: No audio data sent to servers  
✅ **Complete Audio Transcription**: Processes entire recording as one segment when stopped  
✅ **Speaker Detection**: Basic heuristic-based speaker identification  
✅ **Chinese Language Support**: Optimized for Chinese speech recognition  
✅ **Automatic Fallback**: WebGPU → CPU if hardware acceleration unavailable

## File Structure

```
src/
├── lib/
│   ├── transformersTranscribe.ts    # New client-side transcriber
│   └── transcribe.ts                # Legacy WebSocket transcriber (unused)
└── components/
    └── TranscriptionArea.tsx        # Updated to use new transcriber
```

## Configuration

### Next.js Configuration (next.config.js)

- WebAssembly support for Transformers.js
- Cross-origin headers for WebGPU
- Webpack fallbacks for browser environment

### Model Selection

Current model: `Xenova/whisper-small`

- **Size**: ~244MB download
- **Languages**: Multilingual (Chinese, English, etc.)
- **Accuracy**: Good balance of speed vs accuracy

Alternative models you can use:

- `Xenova/whisper-tiny`: Faster, smaller (~39MB), less accurate
- `Xenova/whisper-base`: Larger (~142MB), more accurate
- `Xenova/whisper-medium`: Even larger (~769MB), highest accuracy

To change the model, update the pipeline initialization in `transformersTranscribe.ts`:

```typescript
this.transcriber = await pipeline(
  "automatic-speech-recognition",
  "Xenova/whisper-tiny", // <- Change this
  { device: "webgpu", dtype: "fp32" },
);
```

## Performance Considerations

### First Load

- Initial model download (~244MB for whisper-small)
- Model initialization time (~10-30 seconds)
- Cached for subsequent usage

### Runtime

- **WebGPU**: Fast processing of complete audio
- **CPU**: Slower but still usable for complete transcription
- **Memory**: ~500MB-1GB during transcription processing
- **Processing**: Occurs only when recording stops

## Speaker Detection

The current implementation uses simple keyword-based heuristics:

```typescript
// Doctor keywords: 诊断, 治疗, 药物, 检查, 建议, 医生, 处方
// Patient keywords: 疼痛, 不舒服, 症状, 感觉, 担心, 患者
```

**Improvements possible:**

- Voice activity detection (VAD)
- Speaker embedding models
- Machine learning-based speaker diarization

## Usage

The transcription processes the complete recording when the user stops recording:

```typescript
// Initialize transcriber
const transcriber = new TransformersAudioTranscriber();

// Set up transcription completion callback
transcriber.setOnTranscriptionUpdate((segments) => {
  // This will be called once when transcription completes
  setTranscriptionSegments(segments);
});

// Start recording (no processing yet)
await transcriber.startTranscription();

// Stop recording and process complete audio
transcriber.stopTranscription(); // This triggers transcription
```

## Browser Compatibility

### Required Features

- **WebRTC** (MediaDevices.getUserMedia): All modern browsers
- **WebAssembly**: All modern browsers
- **WebGPU** (optional): Chrome 113+, Edge 113+

### Fallback Strategy

1. Try WebGPU acceleration
2. Fall back to CPU processing
3. Display clear error messages if unsupported

## Security & Privacy

✅ **Privacy-First**: All audio processing happens locally  
✅ **No Data Upload**: Audio never leaves the user's device  
✅ **HTTPS Required**: Secure context needed for microphone access

## Troubleshooting

### Common Issues

1. **Model Loading Fails**
   - Check internet connection for initial download
   - Verify CORS headers are properly configured

2. **No WebGPU Acceleration**
   - Update to Chrome 113+ or Edge 113+
   - CPU fallback will work but slower

3. **Microphone Access Denied**
   - Ensure HTTPS (required for getUserMedia)
   - Check browser permissions

4. **Poor Transcription Quality**
   - Ensure good microphone quality
   - Minimize background noise
   - Consider upgrading to whisper-base or whisper-medium model

### Debug Logs

Check browser console for detailed logging:

- Model initialization status
- Audio processing pipeline
- Transcription results
- Error messages

## Future Enhancements

- [ ] Custom wake word detection
- [ ] Multiple language detection
- [ ] Voice activity detection (VAD)
- [ ] Custom speaker identification training
- [ ] Streaming audio processing optimization
- [ ] Custom model fine-tuning for medical terminology
