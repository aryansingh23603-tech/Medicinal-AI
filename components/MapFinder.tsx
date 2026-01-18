import React, { useState, useEffect } from 'react';
import { findNearbyPlaces } from '../services/gemini';
import { GroundingChunk } from '../types';

export const MapFinder: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<GroundingChunk[]>([]);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>("");

  const fetchPlaces = () => {
    setLoading(true);
    setLocationError(null);
    setPlaces([]);
    setSummary("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const result = await findNearbyPlaces(latitude, longitude, "Hospitals and Emergency Clinics");
          
          setSummary(result.text);
          if (result.chunks) {
            // Filter to only map chunks
            const mapChunks = result.chunks.filter(c => c.maps);
            setPlaces(mapChunks);
          }
        } catch (err) {
            setLocationError("Failed to fetch data.");
        } finally {
            setLoading(false);
        }
      },
      () => {
        setLocationError("Unable to retrieve your location.");
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    fetchPlaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-full">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-medic-neonGreen">Nearby Care</h1>
        <p className="text-gray-400 text-sm">AI-Ranked Hospitals & Clinics</p>
      </header>

      {locationError && (
        <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-xl mb-4 text-red-200">
          {locationError}
          <button onClick={fetchPlaces} className="ml-2 underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-medic-neonGreen border-t-transparent rounded-full animate-spin mb-4" />
            <p className="animate-pulse text-medic-neonGreen">Locating best options...</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4">
            {/* AI Summary */}
            <div className="glass-card p-4 rounded-2xl border-medic-neonGreen/30">
                <h3 className="text-medic-neonGreen font-bold mb-2 text-xs uppercase tracking-wider">AI Insight</h3>
                <div className="text-sm text-gray-300 leading-relaxed markdown">
                    {summary}
                </div>
            </div>

            {/* List of Places from Grounding */}
            {places.map((place, idx) => {
                const mapData = place.maps!;
                const snippet = mapData.placeAnswerSources?.reviewSnippets?.[0]?.reviewText;
                return (
                    <a 
                        key={idx} 
                        href={mapData.uri} 
                        target="_blank" 
                        rel="noreferrer"
                        className="block glass-card p-4 rounded-xl hover:bg-white/5 transition-colors border-l-4 border-l-medic-neonGreen"
                    >
                        <h3 className="font-bold text-lg text-white">{mapData.title}</h3>
                        <p className="text-xs text-gray-500 mt-1 mb-2">Google Maps Verified</p>
                        {snippet && (
                            <p className="text-xs text-gray-400 italic">"{snippet.substring(0, 100)}..."</p>
                        )}
                        <div className="mt-3 flex justify-end">
                             <span className="text-medic-neonGreen text-xs font-bold flex items-center">
                                NAVIGATE ➤
                             </span>
                        </div>
                    </a>
                )
            })}
        </div>
      )}
    </div>
  );
};