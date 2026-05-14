import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MovieCard } from '../../shared/components/movie-card/movie-card';
import { FavoritesService } from '../../core/services/favorites.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, MovieCard],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css'
})
export class FavoritesComponent {
  private favoritesService = inject(FavoritesService);
  
  // Exponemos la signal a la plantilla
  favorites = this.favoritesService.favorites;
}
