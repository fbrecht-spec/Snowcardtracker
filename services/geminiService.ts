
import { GoogleGenAI, Type } from "@google/genai";

export const fetchLatestResortPrice = async (resortName: string): Promise<number | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Was ist der aktuelle Preis für eine Tageskarte (Erwachsene, Hauptsaison) im Skigebiet ${resortName} in Tirol für die Saison 2024/2025? Antworte nur mit der Zahl in Euro.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            price: {
              type: Type.NUMBER,
              description: "The price of a daily adult ski pass in Euro",
            }
          },
          required: ["price"]
        }
      }
    });

    // Handle potential undefined response.text property
    const text = response.text;
    if (!text) return null;
    const data = JSON.parse(text);
    return data.price || null;
  } catch (error) {
    console.error("Error fetching price from Gemini:", error);
    return null;
  }
};

export const fetchSkiRecommendation = async (visitedResorts: string[]): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const resortsString = visitedResorts.join(", ");
    const prompt = `Erstelle eine konkrete Empfehlung für ein Skigebiet in Tirol für den nächsten Skitag (Morgen). 
    Berücksichtige:
    1. Aktuelle Wettervorhersage und Schneequalität in Tirol.
    2. Fahrstrecke und Erreichbarkeit von München/Harlaching aus (A8/A95).
    3. Bevorzugte Gebiete basierend auf bisherigen Besuchen: ${resortsString}.
    Nenne ein spezifisches Gebiet, erkläre kurz warum (Schnee, Wetter, Fahrtzeit) und gib einen "Geheimtipp" für eine Hütte oder Piste dort. Max 3-4 Sätze.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    return response.text || "Empfehlung momentan nicht verfügbar.";
  } catch (error) {
    console.error("Error fetching recommendation:", error);
    return "Fehler beim Abrufen der AI-Empfehlung.";
  }
};

export const fetchHutRecommendation = async (resortName: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Suche eine Hüttenempfehlung für die Mittagspause im Skigebiet ${resortName} in Tirol. 
    Kriterien: 
    - Selbstbedienung (SB) bevorzugt.
    - Nicht zu teuer (gutes Preis-Leistungs-Verhältnis).
    - Gut bewertet von Skifahrern.
    Beschreibe kurz die Hütte, die Atmosphäre und was man dort unbedingt essen sollte. Max 2-3 Sätze.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    return response.text || "Hüttenempfehlung momentan nicht verfügbar.";
  } catch (error) {
    console.error("Error fetching hut recommendation:", error);
    return "Fehler beim Abrufen der Hüttenempfehlung.";
  }
};
