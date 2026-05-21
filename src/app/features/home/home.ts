import { Component, inject, OnInit, signal, AfterViewInit, ElementRef, ViewChild, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MovieService } from '../../core/services/movie.service';
import { HeroComponent } from './components/hero/hero'; // Importamos el Hero
import { MovieSlider } from '../../shared/components/movie-slider/movie-slider'; // Agregamos MovieSlider a las importaciones
import { MovieCard } from '../../shared/components/movie-card/movie-card'; // Importamos MovieCard para la grilla del catálogo
import { Movie } from '../../core/models/movie.model';
import { SkeletonCard } from '../../shared/components/skeleton-card/skeleton-card';
import { SkeletonHero } from '../../shared/components/skeleton-hero/skeleton-hero';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeroComponent, MovieSlider, MovieCard, SkeletonCard, SkeletonHero],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit, AfterViewInit {
  private movieService = inject(MovieService);
  private platformId = inject(PLATFORM_ID);

  @ViewChild('infiniteAnchor') infiniteAnchor!: ElementRef;

  // Declaramos nuestras Signals para almacenar el estado de forma reactiva
  featuredMovie = signal<Movie | null>(null);
  trendingMovies = signal<Movie[]>([]);
  popularMovies = signal<Movie[]>([]);

  // Estado para el catálogo paginado y scroll infinito
  catalogMovies = signal<Movie[]>([]);
  currentPage = signal(1);
  isFetchingNextPage = signal(false);

  // Señales de carga independientes para cada slider
  isLoadingTrending = signal(true);
  isLoadingPopular = signal(true);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    console.log('🏠 Home inicializado. Cargando contenido...');

    // 1. Pedimos las tendencias
    this.movieService.getTrendingMovies().subscribe({
      next: (data) => {
        if (data.results.length > 0) {
          this.featuredMovie.set(data.results[0]); // Ponemos la #1 como Destacada
          this.trendingMovies.set(data.results);   // Guardamos la lista completa para el Slider
        }
        this.isLoadingTrending.set(false);
      },
      error: () => {
        this.isLoadingTrending.set(false);
      }
    });

    // 2. Pedimos las populares para el slider
    this.movieService.getPopularMovies().subscribe({
      next: (data) => {
        this.popularMovies.set(data.results);
        this.isLoadingPopular.set(false);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar las películas.');
        this.isLoadingPopular.set(false);
        this.isLoading.set(false);
      }
    });
  }

  ngAfterViewInit(): void {
    // 3. Solo configuramos el observador en el navegador (SSR Safety)
    if (isPlatformBrowser(this.platformId)) {
      this.initInfiniteScroll();
    }
  }

  private initInfiniteScroll(): void {
    const observer = new IntersectionObserver((entries) => {
      // 4. Si el usuario entra en el campo de visión y no estamos cargando...
      if (entries[0].isIntersecting && !this.isFetchingNextPage()) {
        this.loadMoreMovies();
      }
    }, { rootMargin: "200px" }); // 'rootMargin' permite cargar 200px antes de llegar al final

    observer.observe(this.infiniteAnchor.nativeElement);
  }

  loadMoreMovies(): void {
    this.isFetchingNextPage.set(true);
    this.movieService.getPopularMovies(this.currentPage()).subscribe({
      next: (data) => {
        // 5. Inmutabilidad: Concatenamos los resultados usando el operador spread [...]
        this.catalogMovies.set([...this.catalogMovies(), ...data.results]);
        this.currentPage.update(p => p + 1);
        this.isFetchingNextPage.set(false);
      },
      error: () => {
        this.error.set('Error al cargar más películas para el catálogo.');
        this.isFetchingNextPage.set(false);
      }
    });
  }
}
