import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Comment } from '../models/comment.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private http = inject(HttpClient);

  // ──────────────────────────────────────────────────────────────────────────
  // 👉 CONFIGURACIÓN PERSONALIZADA - ¡CAMBIA ESTOS VALORES!
  // ──────────────────────────────────────────────────────────────────────────
  private API_URL = 'https://api-comentarios-gm6f.onrender.com/api/comments';
  private APP_ID  = 'MovieNexus-Diego'; // Identificador único de tu aplicación

  /**
   * Obtiene los comentarios de un ítem filtrados por tu AppID
   */
  getComments(itemId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.API_URL}/${this.APP_ID}/${itemId}`);
  }

  /**
   * Envía un nuevo comentario al servidor
   */
  addComment(itemId: string, author: string, text: string, rating: number): Observable<Comment> {
    const body: Comment = {
      appId: this.APP_ID,
      itemId,
      author,
      text,
      rating
    };
    return this.http.post<Comment>(this.API_URL, body);
  }
}
