import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Movie, MovieResponse } from '../models/movie.model';
import { CreditsResponse } from '../models/cast.model';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private http = inject(HttpClient);
  private apiUrl = environment.baseUrl;

  getTrendingMovies(): Observable<MovieResponse> {
    // Retornamos un Observable (una promesa de que llegarán datos)
    return this.http.get<MovieResponse>(`${this.apiUrl}/trending/movie/day`);
  }

  /**
   * Obtiene las películas populares con soporte para paginación.
   */
  getPopularMovies(page: number = 1) {
    return this.http.get<MovieResponse>(`${this.apiUrl}/movie/popular`, {
      params: { page: page.toString() }
    });
  }

  // Obtener películas mejor valoradas
  getTopRatedMovies(page: number = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.apiUrl}/movie/top_rated?page=${page}`
    );
  }

  // Obtener estrenos
  getNowPlayingMovies(page: number = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.apiUrl}/movie/now_playing?page=${page}`
    );
  }

  /**
   * Busca películas por término de búsqueda.
   * @param query Texto a buscar
   */
  searchMovies(query: string) {
    return this.http.get<MovieResponse>(`${this.apiUrl}/search/movie`, {
      params: { query } // Angular convierte esto en ?query=Batman automáticamente
    });
  }

  // Obtener el detalle de una película por ID
  getMovieById(id: string | number): Observable<Movie> {
    return this.http.get<Movie>(
      `${this.apiUrl}/movie/${id}`
    );
  }

  getMovieCredits(id: string | number) {
    return this.http.get<CreditsResponse>(
      `${this.apiUrl}/movie/${id}/credits`
    );
  }

  /**
   * Obtiene los videos (tráilers, teasers, etc.) de una película.
   * @param id ID de la película en TMDB
   */
  getMovieVideos(id: string | number) {
    return this.http.get<{ results: Array<{ key: string; site: string; type: string; name: string }> }>(
      `${this.apiUrl}/movie/${id}/videos`
    );
  }

  // Construir la URL completa de una imagen
  getImageUrl(path: string, size: string = 'w500'): string {
    return `${environment.imgPath}/${size}${path}`;
  }
}
