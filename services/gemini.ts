import { GoogleGenAI, Type, Schema, LiveServerMessage, Modality } from "@google/genai";
import { MedicineAnalysis, GroundingChunk } from "../types";
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from "./audioUtils";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- Image Analysis (Nano Banana + Pro Thinking) ---

export const enhanceAndAnalyzeImage = async (base64Image: string): Promise<MedicineAnalysis> => {
  // Step 1: "Nano Banana" Enhancement Phase
  // We use gemini-2.5-flash-image to first "see" the image clearly.
  // In a real native app, this might be a local filter, but here we use the model to validate/preprocess.
  try {
    const enhancementResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: "Confirm if this image contains medicine, a pill bottle, or a medical box. Return 'VALID' if yes, 'INVALID' if no." }
        ]
      }
    });
    
    const validText = enhancementResponse.text?.trim();
    if (validText?.includes('INVALID')) {
        throw new Error("No medicine detected. Please try scanning again.");
    }
  } catch (e) {
    console.warn("Enhancement check skipped or failed", e);
  }

  // Step 2: Deep Analysis with Gemini 3 Pro (Thinking)
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Brand name of the medicine" },
      genericName: { type: Type.STRING, description: "Generic chemical composition" },
      purpose: { type: Type.STRING, description: "Primary use case (e.g., Pain relief)" },
      dosage: { type: Type.STRING, description: "General dosage guidelines found on label or standard knowledge" },
      sideEffects: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of common side effects" },
      warnings: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Critical safety warnings" },
      manufacturer: { type: Type.STRING, description: "Manufacturer name if visible" }
    },
    required: ["name", "genericName", "purpose", "sideEffects", "warnings"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: "Analyze this medicine image. Extract detailed information. If text is blurry, infer from visible branding or shape known in medical databases. Provide safety warnings." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      thinkingConfig: { thinkingBudget: 2048 } // Using thinking for deep analysis
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to analyze image");
  return JSON.parse(text) as MedicineAnalysis;
};

// --- Personal Doctor Chat (Text + Search Grounding) ---

export const sendChatMessage = async (
  history: { role: 'user' | 'model'; text: string }[],
  newMessage: string
): Promise<{ text: string; chunks?: GroundingChunk[] }> => {
  
  // Using Flash 3 for search grounding as per requirements
  const model = 'gemini-3-flash-preview';

  try {
    const chat = ai.chats.create({
      model,
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      })),
      config: {
        tools: [{ googleSearch: {} }], // Grounding enabled
        systemInstruction: "You are Dr. AI, a safe, professional, and helpful medical assistant. You do not provide diagnoses, but you explain medicines, side effects, and interactions clearly. Always verify with search for recalls."
      }
    });

    const result = await chat.sendMessage({ message: newMessage });
    return {
      text: result.text || "I couldn't process that request.",
      chunks: result.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]
    };
  } catch (error) {
    console.error("Chat error:", error);
    return { text: "I'm having trouble connecting to the medical database right now." };
  }
};

// --- Hospital Finder (Maps Grounding) ---

export const findNearbyPlaces = async (lat: number, lng: number, query: string): Promise<{ text: string; chunks?: GroundingChunk[] }> => {
  try {
    // Requirements specify gemini-2.5-flash for Maps
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Find ${query} near me. List the top 3 best rated options with their distance and rating.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
            googleSearch: undefined, // Explicitly disable search to allow maps
            retrievalConfig: {
                latLng: {
                    latitude: lat,
                    longitude: lng
                }
            }
        }
      }
    });

    return {
      text: response.text || "No places found.",
      chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]
    };
  } catch (error) {
    console.error("Maps error:", error);
    return { text: "Could not retrieve location data." };
  }
};

// --- Live API (Voice Doctor) ---

export const connectLiveSession = async (
  onAudioData: (buffer: AudioBuffer) => void,
  onClose: () => void
) => {
  const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
  const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  let nextStartTime = 0;
  
  // Get microphone stream
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
  const sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    config: {
      responseModalities: [Modality.AUDIO],
      systemInstruction: "You are a helpful medical assistant. Keep answers concise and comforting.",
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
      }
    },
    callbacks: {
      onopen: () => {
        console.log("Live Session Connected");
        const source = inputAudioContext.createMediaStreamSource(stream);
        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
        
        scriptProcessor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmBlob = createPcmBlob(inputData);
          sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
        };
        
        source.connect(scriptProcessor);
        scriptProcessor.connect(inputAudioContext.destination);
      },
      onmessage: async (msg: LiveServerMessage) => {
        const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
           nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
           const audioBuffer = await decodeAudioData(
             base64ToUint8Array(base64Audio),
             outputAudioContext
           );
           
           // Pass buffer back to component for visualizer
           onAudioData(audioBuffer);

           const source = outputAudioContext.createBufferSource();
           source.buffer = audioBuffer;
           source.connect(outputAudioContext.destination);
           source.start(nextStartTime);
           nextStartTime += audioBuffer.duration;
        }
      },
      onclose: () => {
        console.log("Live Session Closed");
        inputAudioContext.close();
        outputAudioContext.close();
        stream.getTracks().forEach(t => t.stop());
        onClose();
      },
      onerror: (err) => {
        console.error("Live Session Error", err);
        onClose();
      }
    }
  });

  return {
    disconnect: async () => {
      const session = await sessionPromise;
      session.close();
    }
  };
};