import { Component, inject, OnInit, signal } from '@angular/core';
import { MovieService } from '../../core/services/movie.service';
import { Movie } from '../../core/models/movie.model';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MovieCardComponent],
  template: `
    <!-- Hero Section -->
    <div class="hero-container">
      <div class="hero-content">
        <h1 class="hero-title">
          Bienvenido a <span class="gradient-text">MovieNexus</span>
        </h1>
        <p class="hero-subtitle">
          Explora las películas más populares, busca tus favoritas y mantente al día con los últimos estrenos.
        </p>
        <button class="hero-button" (click)="scrollToMovies()">Empezar a Explorar</button>
      </div>
    </div>

    <!-- Películas Populares -->
    <section class="movies-section" id="movies">
      <div class="section-header">
        <h2 class="section-title">🔥 Películas Populares</h2>
      </div>

      @if (isLoading()) {
        <div class="spinner-container">
          <div class="spinner"></div>
        </div>
      }

      @if (error()) {
        <div class="error-msg">
          ⚠️ {{ error() }}
        </div>
      }

      @if (!isLoading() && !error()) {
        <!-- <div class="movies-grid">
          @for (movie of movies(); track movie.id) {
            <app-movie-card [movie]="movie" />
          }
        </div> -->
      }
    </section>
  `,
  styles: [`
    .hero-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      background: radial-gradient(circle at center, rgba(30, 41, 59, 0.5) 0%, var(--background) 100%);
      padding: 0 1rem;
    }

    .hero-content {
      max-width: 800px;
      animation: fadeIn 1s ease-out;
    }

    .hero-title {
      font-size: clamp(2.5rem, 8vw, 4.5rem);
      line-height: 1.1;
      margin-bottom: 1rem;
      color: #fff;
    }

    .gradient-text {
      background: linear-gradient(90deg, #38bdf8, #f472b6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 800;
    }

    .hero-subtitle {
      font-size: clamp(1.1rem, 3vw, 1.4rem);
      color: #94a3b8;
      margin-bottom: 2rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .hero-button {
      background-color: #38bdf8;
      color: #0f172a;
      border: none;
      padding: 1rem 2.5rem;
      font-size: 1.1rem;
      font-weight: 600;
      border-radius: 50px;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 10px 25px -5px rgba(56, 189, 248, 0.4);
    }

    .hero-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 30px -5px rgba(56, 189, 248, 0.6);
      background-color: #7dd3fc;
    }

    .movies-section {
      max-width: 1200px;
      margin: 0 auto;
      padding: 3rem 1.5rem;
    }

    .section-title {
      font-size: 1.8rem;
      color: #f8fafc;
      margin-bottom: 1.5rem;
    }

    .movies-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 1.25rem;
    }

    .spinner-container {
      display: flex;
      justify-content: center;
      padding: 4rem;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(56, 189, 248, 0.2);
      border-top-color: #38bdf8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .error-msg {
      text-align: center;
      color: #f87171;
      padding: 2rem;
      background: rgba(248, 113, 113, 0.1);
      border-radius: 12px;
      font-size: 1rem;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (min-width: 640px) {
      .movies-grid {
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      }
    }

    @media (min-width: 1024px) {
      .movies-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  private movieService = inject(MovieService);

  movies = signal<Movie[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    console.log('🏠 Home inicializado. Cargando películas...');
    this.movieService.getTrendingMovies().subscribe({
      next: (response) => {
        console.log('✅ ¡Éxito! Datos recibidos de TMDB:', response.results);
        this.movies.set(response.results);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las películas. Verifica tu API Key.');
        this.isLoading.set(false);
      }
    });
  }

  scrollToMovies(): void {
    document.getElementById('movies')?.scrollIntoView({ behavior: 'smooth' });
  }
}
