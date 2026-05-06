import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Movie, MovieResponse } from '../models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;
  private apiKey = environment.apiKey;

  // Obtener películas populares
  getPopularMovies(page: number = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.baseUrl}/movie/popular?api_key=${this.apiKey}&language=es-ES&page=${page}`
    );
  }

  // Obtener películas mejor valoradas
  getTopRatedMovies(page: number = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.baseUrl}/movie/top_rated?api_key=${this.apiKey}&language=es-ES&page=${page}`
    );
  }

  // Obtener estrenos
  getNowPlayingMovies(page: number = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.baseUrl}/movie/now_playing?api_key=${this.apiKey}&language=es-ES&page=${page}`
    );
  }

  // Buscar películas por nombre
  searchMovies(query: string, page: number = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.baseUrl}/search/movie?api_key=${this.apiKey}&language=es-ES&query=${query}&page=${page}`
    );
  }

  // Obtener el detalle de una película por ID
  getMovieById(id: number): Observable<Movie> {
    return this.http.get<Movie>(
      `${this.baseUrl}/movie/${id}?api_key=${this.apiKey}&language=es-ES`
    );
  }

  // Construir la URL completa de una imagen
  getImageUrl(path: string, size: string = 'w500'): string {
    return `${environment.imgPath}/${size}${path}`;
  }
}
