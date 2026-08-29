import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useSpeech } from "../hooks/useSpeech";

type SpeechContextType = {
  speak: (text: string) => void;
  cancel: () => void;
  isSpeaking: boolean;
  ttsEnabled: boolean;
  setTtsEnabled: (enabled: boolean) => void;
  ttsSupported: boolean;
};

const SpeechContext = createContext<SpeechContextType>({
  speak: () => {},
  cancel: () => {},
  isSpeaking: false,
  ttsEnabled: false,
  setTtsEnabled: () => {},
  ttsSupported: false,
});

export function SpeechProvider({ children }: { children: React.ReactNode }) {
  const { speak: rawSpeak, cancel, isSpeaking, isSupported } = useSpeech();

  const [ttsEnabled, setTtsState] = useState(() => {
    try {
      return localStorage.getItem("raiz-do-bem:tts") === "true";
    } catch {
      return false;
    }
  });

  const setTtsEnabled = useCallback(
    (enabled: boolean) => {
      setTtsState(enabled);
      try {
        localStorage.setItem("raiz-do-bem:tts", String(enabled));
      } catch {}
      if (!enabled) cancel();
    },
    [cancel],
  );

  const speak = useCallback(
    (text: string) => {
      if (ttsEnabled && isSupported) rawSpeak(text);
    },
    [ttsEnabled, isSupported, rawSpeak],
  );

  // Cancela fala ao desmontar (ex: troca de rota)
  useEffect(() => cancel, [cancel]);

  return (
    <SpeechContext.Provider
      value={{ speak, cancel, isSpeaking, ttsEnabled, setTtsEnabled, ttsSupported: isSupported }}
    >
      {children}
    </SpeechContext.Provider>
  );
}

export function useSpeechContext() {
  return useContext(SpeechContext);
}
