// Simple string hash function
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

export const getVoices = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
        // Must wait for voices to be loaded.
        let voices = speechSynthesis.getVoices();
        if (voices.length) {
            resolve(voices);
            return;
        }
        speechSynthesis.onvoiceschanged = () => {
            voices = speechSynthesis.getVoices();
            resolve(voices);
        };
    });
};

export const getVoiceForPhilosopher = (philosopherId: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
    if (!voices.length) return null;

    // This function attempts to select a higher-quality, more "human-like" voice
    // from the voices available in the user's browser. The quality and variety
    // are highly dependent on the user's OS and browser.

    const allEnglishVoices = voices.filter(v => v.lang.startsWith('en'));
    if (!allEnglishVoices.length) {
        return voices[0] || null; // Fallback to any voice if no English is found
    }

    // Tier 1: Prefer a curated list of high-quality voices known to exist on
    // various platforms. This includes voices that are often described as "enhanced" or "neural".
    const premiumVoiceNames = [
        // High-quality voices on Chrome/Android
        'Google US English', 
        'Google UK English Female',
        'Google UK English Male',
        // High-quality voices on macOS/iOS
        'Samantha', // US (Good default)
        'Alex',     // US (Often considered very high quality)
        'Daniel',   // UK
        'Fiona',    // Scotland
        'Moira',    // Ireland
        'Tessa',    // South Africa
        // High-quality voices on Windows
        'Microsoft Zira - English (United States)',
        'Microsoft David - English (United States)',
        'Microsoft Mark - English (United States)',
    ];
    const premiumVoices = allEnglishVoices.filter(v => premiumVoiceNames.includes(v.name));

    // Tier 2: Prefer local (often higher quality) US English voices.
    // The `localService` flag is a strong indicator of a high-quality, non-robotic voice.
    const localUSVoices = allEnglishVoices.filter(v => v.lang === 'en-US' && v.localService);
    
    // Tier 3: Any other local English voices (UK, AU, etc.).
    const localVoices = allEnglishVoices.filter(v => v.localService);
    
    // Create a pool of voices, prioritizing the tiers to get the best available option.
    // Using a Set to avoid duplicates and maintain insertion order for prioritization.
    const prioritizedVoices = new Set([
        ...premiumVoices,
        ...localUSVoices,
        ...localVoices,
        ...allEnglishVoices // Add all remaining English voices as a final fallback
    ]);
    
    const voicePool = Array.from(prioritizedVoices);

    if (!voicePool.length) {
        // This case should be rare since we have fallbacks.
        return allEnglishVoices[0] || voices[0] || null;
    }
    
    // Deterministic selection based on philosopher's ID hash to ensure a consistent voice.
    const index = simpleHash(philosopherId) % voicePool.length;
    return voicePool[index];
};