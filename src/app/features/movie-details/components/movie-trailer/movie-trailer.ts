import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../../../core/services/movie.service';
import { SafePipe } from '../../../../shared/pipes/safe.pipe';

@Component({
  selector: 'app-movie-trailer',
  standalone: true,
  imports: [CommonModule, SafePipe],
  template: `
    @if (videoUrl) {
      <div class="trailer-container">
        <h2>Tráiler Oficial</h2>
        <div class="video-wrapper">
          <iframe 
            [src]="videoUrl | safe" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
      </div>
    }
  `,
  styles: [`
    .trailer-container {
      margin-top: 3rem;
      margin-bottom: 2rem;
    }
    .trailer-container h2 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: var(--text-main);
    }
    .video-wrapper {
      position: relative;
      padding-bottom: 56.25%; /* Relación de aspecto 16:9 */
      height: 0;
      overflow: hidden;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: #000;
    }
    .video-wrapper iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  `]
})
export class MovieTrailer implements OnInit {
  private movieService = inject(MovieService);
  
  @Input({ required: true }) movieId!: string | number;
  
  videoUrl: string | null = null;

  ngOnInit(): void {
    if (this.movieId) {
      this.movieService.getMovieVideos(this.movieId).subscribe({
        next: (response) => {
          // Buscamos un video de tipo Trailer en YouTube
          const trailer = response.results.find(
            (video) => video.site === 'YouTube' && video.type === 'Trailer'
          );
          
          // Si no hay de tipo Trailer, tomamos el primero disponible
          const activeVideo = trailer || response.results[0];
          
          if (activeVideo) {
            this.videoUrl = `https://www.youtube.com/embed/${activeVideo.key}`;
          }
        },
        error: () => {
          console.error('Error al cargar videos de la película');
        }
      });
    }
  }
}
