import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

// Cargar .env manualmente si existe para desarrollo local en Express
const envPath = join(process.cwd(), '.env');
if (existsSync(envPath)) {
  try {
    const envFile = readFileSync(envPath, 'utf-8');
    for (const line of envFile.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=');
        process.env[key.trim()] = value.trim();
      }
    }
    console.log('✅ Variables de entorno cargadas manualmente en server.ts desde .env');
  } catch (e) {
    console.error('Error al cargar .env en server.ts:', e);
  }
}

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();

// Parsear cuerpo JSON
app.use(express.json());

// Endpoint de Chat con Gemini para soporte en desarrollo local
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'El cuerpo debe contener un array de mensajes.' });
  }

  const apiKey = process.env['GEMINI_API_KEY'];
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY no configurado en el servidor.' });
  }

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

  const contents = messages.map((msg: any) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { responseMimeType: 'application/json', temperature: 0.7 }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `Error de Gemini: ${errorText}` });
    }

    const data: any = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      return res.status(500).json({ error: 'No se recibió respuesta de Gemini.' });
    }

    try {
      const jsonResponse = JSON.parse(textResponse);
      return res.status(200).json(jsonResponse);
    } catch {
      return res.status(200).json({ response: textResponse, recommendedMovies: [] });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error en servidor Express' });
  }
});

const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
