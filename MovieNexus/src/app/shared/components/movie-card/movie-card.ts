import { Component, Input } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { Movie } from '../../../core/models/movie.model';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [DecimalPipe, DatePipe],
  template: `
    <div class="card">
      <div class="card-image">
        <img
          [src]="posterUrl"
          [alt]="movie.title"
          loading="lazy"
        />
        <div class="card-overlay">
          <span class="rating">⭐ {{ movie.vote_average | number:'1.1-1' }}</span>
        </div>
      </div>
      <div class="card-info">
        <h3 class="card-title">{{ movie.title }}</h3>
        <p class="card-year">{{ movie.release_date | date:'yyyy' }}</p>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border-radius: 12px;
      overflow: hidden;
      background: #1e293b;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      position: relative;
    }

    .card:hover {
      transform: translateY(-6px) scale(1.02);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }

    .card-image {
      position: relative;
      aspect-ratio: 2/3;
      overflow: hidden;
    }

    .card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .card:hover .card-image img {
      transform: scale(1.05);
    }

    .card-overlay {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: rgba(0, 0, 0, 0.75);
      border-radius: 20px;
      padding: 0.25rem 0.6rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: #fbbf24;
    }

    .card-info {
      padding: 0.75rem;
    }

    .card-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: #f8fafc;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0 0 0.25rem;
    }

    .card-year {
      font-size: 0.8rem;
      color: #64748b;
      margin: 0;
    }
  `]
})
export class MovieCardComponent {
  @Input({ required: true }) movie!: Movie;
  @Input() imgPath: string = 'https://image.tmdb.org/t/p/w500';

  get posterUrl(): string {
    if (this.movie.poster_path) {
      return `${this.imgPath}${this.movie.poster_path}`;
    }
    return 'https://placehold.co/300x450/1e293b/64748b?text=Sin+Imagen';
  }
}
