export class AudioTranscriber {
  ws: WebSocket | null = null;
  mediaStream: MediaStream | null = null;
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  isTranscribing: boolean = false;
  transcriptionResult: string = "";
  intervalId: NodeJS.Timeout | null = null;
  periodCount: number = 0;

  constructor(socketAddr: string) {
    this.ws = new WebSocket(socketAddr);
    this.ws.binaryType = "arraybuffer";
    this.ws.onmessage = (event: MessageEvent) => {
      if (event.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          this.transcriptionResult += reader.result as string;
        };
        reader.readAsText(event.data);
      } else if (typeof event.data === "string") {
        this.transcriptionResult += event.data;
      }
    };
    this.ws.onopen = () => {
      console.log("WebSocket connection established");
    };
    this.ws.onclose = () => {
      console.log("WebSocket connection closed");
      this.isTranscribing = false;
    };
  }

  sendBlob(blob: Blob) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(blob);
    } else {
      console.error("WebSocket is not open. Cannot send blob.");
    }
  }

  async startTranscription() {
    if (this.isTranscribing) return;
    this.isTranscribing = true;
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        bitsPerSecond: 16000,
        mimeType: "audio/webm;codecs=opus",
      });
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks);
        this.ws?.send(audioBlob);
      };

      setInterval(() => {
        const audioBlob = new Blob(this.audioChunks);
        console.log("Sending audio blob to server for test");
        this.ws?.send(audioBlob);
      }, 3000);

      this.mediaRecorder.start(1000);
    } catch (error) {
      console.error("Error starting transcription:", error);
    }
  }

  stopTranscription() {
    console.log("Stopping transcription", this.isTranscribing);
    const audioBlob = new Blob(this.audioChunks, { type: "audio/wav" });
    console.log("Sending audio blob to server");
    this.isTranscribing = false;
    this.mediaRecorder?.stop();
    this.ws?.send(audioBlob);
  }

  terminate() {
    this.mediaStream?.getTracks().forEach((track) => track.stop());
    this.ws?.close();
  }
}
