import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Mic, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";
import remiLogging1 from "@/assets/remi-logging-1.webp";
import remiLogging2 from "@/assets/remi-logging-2.webp";
import remiLogging3 from "@/assets/remi-logging-3.webp";
import remiLogging4 from "@/assets/remi-logging-4.webp";
import remiLogging5 from "@/assets/remi-logging-5.webp";

const remiLoggingImages = [remiLogging1, remiLogging2, remiLogging3, remiLogging4, remiLogging5];

const getRandomLoggingImage = () => {
  return remiLoggingImages[Math.floor(Math.random() * remiLoggingImages.length)];
};

// Includes regular types + onboarding challenge titles + First Hello initiation types for tracking completion
export type HelloType = 'regular_hello' | 'todays_hello' | 'remis_challenge' | 
  'First Hello' | 'Well Wishes' | 'Observation' | 'Nice Shoes' | 
  'How Are You?' | 'Name to the Face' | 'Getting Personal' |
  'Greeting' | 'Compliment' | 'Question' | 'Get a Name';

interface LogHelloScreenProps {
  onBack: () => void;
  onLog: (data: { 
    name?: string; 
    location?: string;
    notes?: string; 
    rating?: 'positive' | 'neutral' | 'negative';
    no_name_flag?: boolean;
  }) => Promise<void>;
  challengeTitle?: string | null;
  helloType?: HelloType;
  autoStartRecording?: boolean;
}

export const LogHelloScreen = ({ 
  onBack, 
  onLog, 
  challengeTitle,
  helloType = 'regular_hello',
  autoStartRecording = false
}: LogHelloScreenProps) => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [noNameFlag, setNoNameFlag] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const remiImage = useMemo(() => getRandomLoggingImage(), []);

  const screenTitle = challengeTitle 
    ? `Complete: ${challengeTitle}` 
    : "Log Your Hello!";

  const getSupportedAudioMimeType = () => {
    if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) return undefined;

    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4",
    ];

    return candidates.find((t) => MediaRecorder.isTypeSupported(t));
  };

  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = getSupportedAudioMimeType();
      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        const finalMimeType = mediaRecorder.mimeType || mimeType || "audio/webm";
        const extension = finalMimeType.includes("mp4") ? "mp4" : "webm";
        const audioBlob = new Blob(chunksRef.current, { type: finalMimeType });

        await processAudio(audioBlob, `recording.${extension}`);
      };

      mediaRecorder.start();
      setIsRecording(true);
      return true;
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Could not access microphone. Please check permissions.");
      return false;
    }
  }, []);

  // Auto-start recording if requested
  useEffect(() => {
    if (!autoStartRecording) {
      setHasAutoStarted(false);
      return;
    }

    if (hasAutoStarted || isRecording || isProcessing) return;

    let cancelled = false;
    (async () => {
      // Call immediately (no timeout) so mobile browsers are more likely to treat this as user-initiated.
      const ok = await startRecording();
      if (!cancelled && ok) setHasAutoStarted(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [autoStartRecording, hasAutoStarted, isRecording, isProcessing, startRecording]);

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob, filename = "recording.webm") => {
    setIsProcessing(true);
    try {
      // Step 1: Transcribe audio
      const formData = new FormData();
      formData.append('audio', audioBlob, filename);

      const transcribeResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-audio`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      if (!transcribeResponse.ok) {
        throw new Error('Transcription failed');
      }

      const transcription = await transcribeResponse.json();
      const transcribedText = transcription.text || '';

      if (!transcribedText) {
        toast.error("No speech detected. Please try again.");
        return;
      }

      // Step 2: Extract name, location, and notes using AI
      const extractResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-name`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text: transcribedText }),
        }
      );

      if (!extractResponse.ok) {
        // Fallback: put everything in notes
        setNotes((prev) => (prev ? `${prev}\n${transcribedText}` : transcribedText));
        toast.success("Transcription added to notes!");
        return;
      }

      const extracted = await extractResponse.json();

      // Update fields
      if (extracted.name && !name) {
        setName(extracted.name);
        setNoNameFlag(false);
      }
      if (extracted.location && !location) {
        setLocation(extracted.location);
      }
      if (extracted.notes) {
        setNotes((prev) => (prev ? `${prev}\n${extracted.notes}` : extracted.notes));
      }

      toast.success("Voice notes added!");
    } catch (error) {
      console.error("Error processing audio:", error);
      toast.error("Failed to process voice recording");
    } finally {
      setIsProcessing(false);
    }
  };

  // Validation: either name or noNameFlag must be set
  const canSubmit = (name.trim() !== "" || noNameFlag) && !isLogging && !isRecording && !isProcessing;

  const handleSubmit = async () => {
    if (!name.trim() && !noNameFlag) {
      toast.error("Please enter a name or check 'Didn't get name'");
      return;
    }

    setIsLogging(true);
    try {
      await onLog({
        name: name || undefined,
        location: location || undefined,
        notes: notes || undefined,
        no_name_flag: noNameFlag,
      });
      setName("");
      setLocation("");
      setNotes("");
      setNoNameFlag(false);
      onBack();
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b border-border flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <img src={remiImage} alt="Remi" className="w-10 h-10 object-contain" />
        <h1 className="text-xl font-bold text-foreground">{screenTitle}</h1>
      </div>
      
      {/* Content - scrollable */}
      <div className="flex-1 p-6 space-y-5 overflow-y-auto">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <div className="flex gap-2">
            <Input
              id="name"
              placeholder="What's their name?"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) setNoNameFlag(false);
              }}
              className="text-base flex-1"
              disabled={noNameFlag}
            />
            <Button
              type="button"
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              className="flex-shrink-0 h-10 w-10"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isRecording ? (
                <Square className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </Button>
          </div>
          {isRecording && (
            <p className="text-sm text-muted-foreground animate-pulse">
              🎙️ Recording... Tap stop when done
            </p>
          )}
          
          {/* Didn't get name checkbox */}
          <div className="flex items-center space-x-2 pt-1">
            <Checkbox 
              id="no-name" 
              checked={noNameFlag}
              onCheckedChange={(checked) => {
                setNoNameFlag(checked === true);
                if (checked) setName("");
              }}
            />
            <label 
              htmlFor="no-name" 
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Didn't get name
            </label>
          </div>
        </div>

        {/* Location Field */}
        <div className="space-y-2">
          <Label htmlFor="location">Where you met</Label>
          <Input
            id="location"
            placeholder="Coffee shop, gym, work..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="text-base"
          />
        </div>

        {/* Notes Field */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="What do you want to remember about them?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-28 text-base"
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          className="w-full h-12 text-lg mt-4" 
          disabled={!canSubmit}
        >
          {isLogging ? "Logging..." : "Log Hello! 👋"}
        </Button>
      </div>
    </div>
  );
};
