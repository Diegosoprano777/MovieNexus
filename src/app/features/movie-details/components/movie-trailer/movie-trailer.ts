// src/app/features/movie-details/components/movie-trailer/movie-trailer.ts
import { Component, Input, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../../../core/services/movie.service';
import { SafePipe } from '../../../../shared/pipes/safe.pipe';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Componente que muestra el tráiler oficial de una película.
 * Usa signals para almacenar la clave del video y carga un iframe de YouTube de forma segura.
 */
@Component({
  selector: 'app-movie-trailer',
  standalone: true,
  imports: [CommonModule, SafePipe],
  template: `
    <ng-container *ngIf="trailerKey() as key; else noTrailer">
      <div class="trailer-wrapper">
        <iframe
          class="trailer-iframe"
          [src]="('https://www.youtube.com/embed/' + key) | safe"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
      </div>
    </ng-container>
    <ng-template #noTrailer>
      <div class="no-trailer">
        <span class="no-trailer-icon">🎬</span>
        <p>No hay tráiler disponible.</p>
      </div>
    </ng-template>
  `,
  styleUrl: './movie-trailer.css'
})
export class MovieTrailer implements OnInit {
  /** ID de la película (de TMDB) */
  @Input() movieId!: number;

  private movieService = inject(MovieService);
  // Signal que almacena la clave del video o null si no se encuentra.
  trailerKey = signal<string | null>(null);

  ngOnInit(): void {
    if (!this.movieId) return;
    // Obtener los videos y buscar el primer tráiler o teaser de YouTube.
    this.movieService.getMovieVideos(this.movieId)
      .pipe(
        map(res => res.results.find(v => v.site === 'YouTube' && /trailer|teaser/i.test(v.type)))
      )
      .subscribe(video => {
        if (video && video.key) {
          this.trailerKey.set(video.key);
        } else {
          this.trailerKey.set(null);
        }
      });
  }
}
