import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../core/services/movie.service';
import { HeroComponent } from './components/hero/hero'; // Importamos el Hero
import { MovieSlider } from '../../shared/components/movie-slider/movie-slider'; // Agregamos MovieSlider a las importaciones
import { Movie } from '../../core/models/movie.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeroComponent, MovieSlider],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  private movieService = inject(MovieService);

  // Declaramos nuestras Signals para almacenar el estado de forma reactiva
  featuredMovie = signal<Movie | null>(null);
  trendingMovies = signal<Movie[]>([]);
  popularMovies = signal<Movie[]>([]);
  
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    console.log('🏠 Home inicializado. Cargando contenido...');
    
    // 1. Pedimos las tendencias
    this.movieService.getTrendingMovies().subscribe({
      next: (data) => {
        if (data.results.length > 0) {
          this.featuredMovie.set(data.results[0]); // Ponemos la #1 como Destacada
          this.trendingMovies.set(data.results); // Guardamos la lista completa para el Slider
        }
      }
    });

    // 2. Pedimos las populares
    this.movieService.getPopularMovies().subscribe({
      next: (data) => {
        this.popularMovies.set(data.results); // Guardamos la lista de populares
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar las películas.');
        this.isLoading.set(false);
      }
    });
  }
}
