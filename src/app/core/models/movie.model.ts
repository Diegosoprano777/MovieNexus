// Interfaz que representa una película de la API de TMDB
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  original_language: string;
  original_title: string;
  video: boolean;
  runtime?: number; // Duración en minutos
  genres?: { id: number; name: string }[]; // Lista de géneros (Ej: Acción, Comedia)
}

// Interfaz para la respuesta de la API (lista de películas)
export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}
