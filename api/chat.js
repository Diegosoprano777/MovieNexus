// api/chat.js
// Función de backend en Node.js para interactuar de forma segura con Gemini API

const fs = require('fs');
const path = require('path');

// Cargar .env manualmente si existe para desarrollo local
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  try {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    for (const line of envFile.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=');
        process.env[key.trim()] = value.trim();
      }
    }
  } catch (e) {
    console.error('Error al cargar .env manualmente en api/chat.js:', e);
  }
}

module.exports = async (req, res) => {
  // Solo se permiten peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Utiliza POST.' });
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'El cuerpo de la petición debe contener un array de mensajes.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'La clave GEMINI_API_KEY no está configurada en las variables de entorno del servidor.'
    });
  }

  // Instrucciones del sistema para definir la personalidad cinéfila y el formato de salida
  const systemInstruction = `Eres Nexus AI, un asistente virtual cinéfilo apasionado y experto en el séptimo arte.
Tu tono es entusiasta, culto pero accesible y cercano. Hablas con propiedad sobre directores, actores, detalles técnicos, bandas sonoras e historia del cine.
Siempre estás listo para recomendar películas o entablar discusiones de manera entretenida.
Debes responder SIEMPRE en formato JSON utilizando exactamente el siguiente esquema estructurado:
{
  "response": "Tu respuesta en texto. Usa Markdown para dar formato (negritas, cursivas, listas con viñetas, saltos de línea) para que la lectura sea atractiva y agradable.",
  "recommendedMovies": ["Título de película 1", "Título de película 2"]
}

Reglas obligatorias:
1. Si en tu respuesta no recomiendas películas de manera explícita para que el usuario las busque, deja el campo "recommendedMovies" como un array vacío [].
2. El array "recommendedMovies" solo debe incluir los títulos claros de las películas mencionadas (por ejemplo: ["Pulp Fiction", "El Club de la Pelea"]). No agregues notas adicionales al array de títulos.
3. Limita las recomendaciones añadidas al array a un máximo de 5 películas por mensaje para no saturar al usuario.
4. Responde siempre en español.`;

  // Mapear los mensajes al formato de contenido de Gemini (user/model con parts)
  const contents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  try {
    // Usamos el modelo gemini-2.5-flash y pasamos la API key por Query Params
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: `Error de la API de Gemini: ${errorText}`
      });
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      return res.status(500).json({ error: 'No se recibió contenido de la API de Gemini.' });
    }

    // Intentamos parsear la respuesta de la IA como JSON
    try {
      const jsonResponse = JSON.parse(textResponse);
      return res.status(200).json(jsonResponse);
    } catch (parseError) {
      // En caso de que falle el parseo de JSON (muy improbable con responseMimeType json), devolvemos el texto en una envoltura segura
      return res.status(200).json({
        response: textResponse,
        recommendedMovies: []
      });
    }
  } catch (error) {
    console.error('Error en api/chat.js:', error);
    return res.status(500).json({
      error: error.message || 'Error interno del servidor en la función proxy de chat.'
    });
  }
};
