import { Component, computed, effect, inject, signal } from '@angular/core';
import { MovieService } from '../../core/services/movie.service';
import { Movie } from '../../core/models/movie.model';
import { MovieCard } from '../../shared/components/movie-card/movie-card';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [MovieCard, EmptyStateComponent],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class Search {
  private movieService = inject(MovieService);

  // ─── Signals (estado reactivo) ───────────────────────────────────────────
  searchQuery  = signal('');
  results      = signal<Movie[]>([]);
  isSearching  = signal(false);
  hasSearched  = signal(false); // true después de la 1ª búsqueda real

  // Signal derivada: ¿hay query pero sin resultados?
  isEmpty = computed(() => this.hasSearched() && !this.isSearching() && this.results().length === 0);

  // Sugerencias de tendencias para búsqueda rápida
  readonly suggestions = [
    { label: '🔥 Avengers', query: 'Avengers' },
    { label: '🚀 Dune', query: 'Dune' },
    { label: '🦇 Batman', query: 'Batman' },
    { label: '🌌 Interstellar', query: 'Interstellar' },
    { label: '🤖 Terminator', query: 'Terminator' }
  ];

  selectSuggestion(query: string): void {
    this.searchQuery.set(query);
  }

  constructor() {
    // Effect con debounce: reacciona cada vez que searchQuery cambia
    effect((onCleanup) => {
      const query = this.searchQuery().trim();

      if (query.length < 2) {
        this.results.set([]);
        this.hasSearched.set(false);
        this.isSearching.set(false);
        return;
      }

      this.isSearching.set(true);

      // Debounce de 350ms — cancelamos si el usuario sigue escribiendo
      const timer = setTimeout(() => {
        this.movieService.searchMovies(query).subscribe({
          next: (res) => {
            this.results.set(res.results);
            this.isSearching.set(false);
            this.hasSearched.set(true);
          },
          error: () => {
            this.results.set([]);
            this.isSearching.set(false);
            this.hasSearched.set(true);
          }
        });
      }, 350);

      onCleanup(() => clearTimeout(timer));
    });
  }

  onInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }
}
