import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Movie } from '../models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private platformId = inject(PLATFORM_ID);
  
  // Nuestra Signal que guarda la lista de películas
  public favorites = signal<Movie[]>(this.loadFavorites());

  constructor() {
    // Cada vez que cambie la signal, la guardamos en localStorage automáticamente
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('movie_favorites', JSON.stringify(this.favorites()));
      }
    });
  }

  // Cargar favoritos del local storage al iniciar
  private loadFavorites(): Movie[] {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('movie_favorites');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          return [];
        }
      }
    }
    return [];
  }

  // Comprobar si una película es favorita
  isFavorite(movieId: number): boolean {
    return this.favorites().some(m => m.id === movieId);
  }

  // Agregar o quitar de favoritos
  toggleFavorite(movie: Movie): void {
    const currentFavs = this.favorites();
    if (this.isFavorite(movie.id)) {
      // Eliminar
      this.favorites.set(currentFavs.filter(m => m.id !== movie.id));
    } else {
      // Agregar
      this.favorites.set([...currentFavs, movie]);
    }
  }
}
