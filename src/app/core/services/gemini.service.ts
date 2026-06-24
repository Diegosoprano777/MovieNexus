import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MovieService } from './movie.service';
import { catchError, forkJoin, map, of, firstValueFrom } from 'rxjs';
import { Movie } from '../models/movie.model';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  movies?: Movie[];
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private http = inject(HttpClient);
  private movieService = inject(MovieService);

  // Historial de chat manejado por un Angular Signal
  readonly messages = signal<ChatMessage[]>([
    {
      role: 'assistant',
      content: '¡Hola! Bienvenido a **Nexus AI**, tu asistente cinéfilo. 🎬 ¿De qué película te gustaría hablar hoy? ¿Buscas alguna recomendación especial o quieres debatir sobre tu director favorito?'
    }
  ]);

  // Estado de carga para mostrar el typing indicator
  readonly loading = signal<boolean>(false);

  /**
   * Envía el mensaje del usuario al backend y procesa las recomendaciones de películas.
   */
  async sendMessage(text: string): Promise<void> {
    if (!text.trim()) return;

    // Agregar el mensaje del usuario al historial
    this.messages.update(prev => [...prev, { role: 'user', content: text }]);
    this.loading.set(true);

    try {
      // Gemini requiere que el historial comience siempre con un mensaje del usuario ('user').
      // Filtramos cualquier mensaje de bienvenida inicial del asistente.
      const firstUserIndex = this.messages().findIndex(msg => msg.role === 'user');
      const messagesToSend = firstUserIndex !== -1 ? this.messages().slice(firstUserIndex) : [];

      const formattedHistory = messagesToSend.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Llamada POST a nuestra función serverless /api/chat
      const chatResponse = await firstValueFrom(
        this.http.post<{ response: string; recommendedMovies: string[] }>('/api/chat', {
          messages: formattedHistory
        })
      );

      const recommendedTitles = chatResponse?.recommendedMovies || [];
      let resolvedMovies: Movie[] = [];

      if (recommendedTitles.length > 0) {
        // Ejecutar búsquedas en paralelo en la API de TMDB para cada título recomendado
        const searchObservables = recommendedTitles.map(title =>
          this.movieService.searchMovies(title).pipe(
            map(response => {
              // Retornar el primer resultado coincidente si existe
              return response.results && response.results.length > 0 ? response.results[0] : null;
            }),
            catchError(() => of(null)) // Ignorar fallas individuales de búsqueda
          )
        );

        // Esperar a que se resuelvan todas las búsquedas de TMDB
        const searchResults = await firstValueFrom(forkJoin(searchObservables));
        
        // Filtrar elementos nulos y películas duplicadas
        const seenIds = new Set<number>();
        resolvedMovies = searchResults.filter((movie): movie is Movie => {
          if (movie && !seenIds.has(movie.id)) {
            seenIds.add(movie.id);
            return true;
          }
          return false;
        });
      }

      // Agregar la respuesta final del asistente cinéfilo al historial
      this.messages.update(prev => [
        ...prev,
        {
          role: 'assistant',
          content: chatResponse?.response || 'He tenido problemas para procesar la recomendación.',
          movies: resolvedMovies
        }
      ]);
    } catch (error) {
      console.error('Error en GeminiService:', error);
      this.messages.update(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Lo siento, ha ocurrido un error al conectar con mi base de datos de películas. Por favor, vuelve a intentarlo.'
        }
      ]);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Borra el historial del chat y lo reinicia al mensaje de bienvenida.
   */
  clearHistory(): void {
    this.messages.set([
      {
        role: 'assistant',
        content: '¡Hola! Bienvenido a **Nexus AI**, tu asistente cinéfilo. 🎬 ¿De qué película te gustaría hablar hoy? ¿Buscas alguna recomendación especial o quieres debatir sobre tu director favorito?'
      }
    ]);
  }
}
