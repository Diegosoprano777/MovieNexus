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

  // NUEVO MÉTODO
  getPopularMovies() {
    return this.http.get<MovieResponse>(`${this.apiUrl}/movie/popular`);
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

  // Buscar películas por nombre
  searchMovies(query: string, page: number = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.apiUrl}/search/movie?query=${query}&page=${page}`
    );
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

  // Construir la URL completa de una imagen
  getImageUrl(path: string, size: string = 'w500'): string {
    return `${environment.imgPath}/${size}${path}`;
  }
}
