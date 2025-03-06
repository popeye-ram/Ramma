import React, { useState } from 'react';
import { Wand2, Image as ImageIcon, Loader2 } from 'lucide-react';

function App() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
        {
          headers: {
            Authorization: `Bearer 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`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ 
            inputs: prompt,
            options: {
              wait_for_model: true
            }
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const blob = await response.blob();
      if (!blob || blob.size === 0) {
        throw new Error('Generated image is empty');
      }

      const imageUrl = URL.createObjectURL(blob);
      setImage(imageUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate image. Please try again.';
      setError(errorMessage);
      setImage(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateImage();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Wand2 className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl font-bold">AI Image Generator</h1>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
          <form onSubmit={handlePromptSubmit} className="mb-6">
            <label htmlFor="prompt" className="block text-sm font-medium mb-2">
              Enter your prompt
            </label>
            <div className="flex gap-3">
              <input
                id="prompt"
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A serene landscape with mountains and a lake at sunset..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-5 h-5" />
                    Generate
                  </>
                )}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-red-400 text-sm">{error}</p>
            )}
          </form>

          <div className="border-t border-gray-700 pt-6">
            {image ? (
              <div className="relative">
                <img
                  src={image}
                  alt="Generated artwork"
                  className="w-full h-auto rounded-lg shadow-2xl"
                  onError={() => {
                    setError('Failed to load the generated image');
                    setImage(null);
                  }}
                />
                <div className="absolute top-4 right-4">
                  <a
                    href={image}
                    download="generated-image.png"
                    className="bg-gray-900 bg-opacity-75 hover:bg-opacity-100 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  >
                    Download
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-gray-700 rounded-lg p-8 text-center">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                <p className="text-gray-400">
                  Your generated image will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;