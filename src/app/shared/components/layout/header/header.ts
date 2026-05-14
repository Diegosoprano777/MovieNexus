import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MovieService } from '../../../core/services/movie.service';
import { Movie } from '../../../core/models/movie.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  private movieService = inject(MovieService);

  // 1. Declaramos nuestras signals
  searchQuery = signal(''); // lo que el usuario escribe
  searchResults = signal<Movie[]>([]); // los resultados que llegan de la API
  isSearching = signal(false); // para mostrar un spinner de carga

  constructor() {
    // 2. El effect: reacciona automáticamente cuando searchQuery cambia
    effect((onCleanup) => {
      const query = this.searchQuery();

      // si el texto es muy corto, no buscamos (ahorramos peticiones)
      if (query.length < 3) {
        this.searchResults.set([]);
        this.isSearching.set(false);
        return;
      }

      this.isSearching.set(true);

      // 3. EL "Debounce": Retrasamos la búsqueda 300ms
      // ¿Por qué? Si el usuario escribe "Batman" muy rápido (6 letras),
      const timeoutId = setTimeout(() => {
        this.movieService.searchMovies(query).subscribe({
          next: (response) => {
            // Tomamos solo los primeros 5 resultados para no llenar la pantalla
            this.searchResults.set(response.results.slice(0, 5));
            this.isSearching.set(false);
          },
          error: () => this.isSearching.set(false)
        });
      }, 300);

      // 4. Limpieza: Si el usuario escribe OTRA letra antes de los 300ms,
      // cancelamos el temporizador anterior.
      onCleanup(() => clearTimeout(timeoutId));
    });
  }

  // Método que conectaremos al HTML para actualizar la signal
  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  // Método para cerrar el buscador al hacer clic en un resultado
  closeSearch() {
    this.searchQuery.set('');
    this.searchResults.set([]);
  }
}
