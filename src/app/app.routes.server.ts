import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'movie/:id',
    renderMode: RenderMode.Server, // Renderizar bajo demanda
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender, // Pre-renderizar
  }
];
