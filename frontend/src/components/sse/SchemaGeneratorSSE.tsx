import { useEffect } from "react";

interface Props {
  courseUuid: string;
  prompt: string;
  onComplete: (schema: any) => void;
  onError: (error: string) => void;
}

const SchemaGeneratorSSE = ({ courseUuid, prompt, onComplete, onError }: Props) => {

  useEffect(() => {
    if (!courseUuid || !prompt) return;

    const startGeneration = async () => {
      try {
        // Conexión
        const token = localStorage.getItem("token");
        const url = new URL(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/schema/generate-stream/${courseUuid}`);
      } catch {}
    }
  }, [])

  return <div>SchemaGeneratorSSE</div>;
};

export default SchemaGeneratorSSE;
