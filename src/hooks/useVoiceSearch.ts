import { useCallback, useEffect, useRef, useState } from "react";

// Chrome expõe a API com o prefixo webkit
declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

function getRecognitionClass(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function useVoiceSearch(onResult: (text: string) => void) {
  const isSupported = !!getRecognitionClass();
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const RecognitionClass = getRecognitionClass();
    if (!RecognitionClass) return;

    const rec = new RecognitionClass();
    rec.lang = "pt-BR";
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      if (transcript) onResultRef.current(transcript);
    };

    recognitionRef.current = rec;
    rec.start();
  }, []);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return { listening, toggle, isSupported };
}
