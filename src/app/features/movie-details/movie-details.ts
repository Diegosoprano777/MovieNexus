import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MovieService } from '../../core/services/movie.service';
import { Movie, CountryProviders, WatchProvidersResponse } from '../../core/models/movie.model';
import { CastCard } from '../../shared/components/cast-card/cast-card';
import { CreditsResponse } from '../../core/models/cast.model';
import { MovieTrailer } from './components/movie-trailer/movie-trailer';
import { MovieComments } from './components/movie-comments/movie-comments';
import { FavoritesService } from '../../core/services/favorites.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule, RouterLink, CastCard, MovieTrailer, MovieComments],
  templateUrl: './movie-details.html',
  styleUrl: './movie-details.css'
})
export class MovieDetails implements OnInit {
  private movieService    = inject(MovieService);
  private favoritesService = inject(FavoritesService);

  @Input() id!: string;

  // ─── Signals de estado ────────────────────────────────────────────────────
  movie    = signal<Movie | null>(null);
  credits  = signal<CreditsResponse | null>(null);
  watchProviders = signal<CountryProviders | null>(null);
  isLoading = signal(true);
  error    = signal<string | null>(null);

  // ─── Signal derivada: ¿es favorito? ──────────────────────────────────────
  isFavorite = signal(false);

  ngOnInit(): void {
    if (!this.id) return;

    forkJoin({
      details: this.movieService.getMovieById(this.id),
      credits: this.movieService.getMovieCredits(this.id),
      providers: this.movieService.getWatchProviders(this.id).pipe(
        catchError(() => of({ id: +this.id, results: {} } as WatchProvidersResponse))
      )
    }).subscribe({
      next: ({ details, credits, providers }) => {
        this.movie.set(details);
        this.credits.set(credits);
        this.isFavorite.set(this.favoritesService.isFavorite(details.id));

        const userLocale = typeof navigator !== 'undefined' ? navigator.language : 'es-ES';
        let countryCode = (userLocale.split('-')[1] || 'ES').toUpperCase();

        if (providers && providers.results) {
          if (!providers.results[countryCode]) {
            const fallbackCode = providers.results['ES'] ? 'ES' : (providers.results['US'] ? 'US' : Object.keys(providers.results)[0]);
            if (fallbackCode) {
              countryCode = fallbackCode;
            }
          }
          this.watchProviders.set(providers.results[countryCode] || null);
        } else {
          this.watchProviders.set(null);
        }

        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar los detalles de esta película.');
        this.isLoading.set(false);
      }
    });
  }

  toggleFavorite(): void {
    const m = this.movie();
    if (!m) return;
    this.favoritesService.toggleFavorite(m);
    this.isFavorite.set(this.favoritesService.isFavorite(m.id));
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  getBackdropUrl(path: string | null | undefined): string {
    return path ? `https://image.tmdb.org/t/p/original${path}` : '';
  }

  getPosterUrl(path: string | null | undefined): string {
    return path ? `https://image.tmdb.org/t/p/w500${path}` : 'assets/no-poster.png';
  }

  /** Convierte minutos a "2h 28min" */
  formatRuntime(minutes: number | undefined): string {
    if (!minutes) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  }

  /** Formatea el número de votos (ej: 14500 → "14.5K") */
  formatVoteCount(count: number): string {
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  }

  getProviderLogoUrl(path: string | null | undefined): string {
    return path ? `https://image.tmdb.org/t/p/w92${path}` : '';
  }
}
