import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../core/services/movie.service';
import { Movie } from '../../core/models/movie.model';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card';
import { HeroComponent } from './components/hero/hero';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MovieCardComponent, HeroComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  private movieService = inject(MovieService);

  // Usamos una Signal para guardar la película destacada
  featuredMovie = signal<Movie | null>(null);
  
  // Lista de todas las películas para la cuadrícula
  movies = signal<Movie[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    console.log('🏠 Home inicializado. Cargando películas...');
    
    this.movieService.getTrendingMovies().subscribe({
      next: (response) => {
        console.log('✅ ¡Éxito! Datos recibidos de TMDB:', response.results);
        
        if (response.results.length > 0) {
          // Tomamos la posición [0] del array para ser el Hero
          this.featuredMovie.set(response.results[0]);
          
          // Guardamos el resto para la cuadrícula
          this.movies.set(response.results);
        }
        
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
