import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <div class="container">
        <div class="logo" routerLink="/">
          Movie<span class="highlight">Nexus</span>
        </div>
        <nav class="nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Inicio</a>
          <a routerLink="/movies" routerLinkActive="active">Películas</a>
          <a routerLink="/search" routerLinkActive="active">Buscar</a>
          <a routerLink="/favorites" routerLinkActive="active">Favoritos</a>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .header {
      position: sticky;
      top: 0;
      left: 0;
      width: 100%;
      z-index: 1000;
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding: 1rem 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 800;
      color: #fff;
      cursor: pointer;
      letter-spacing: -1px;
    }

    .highlight {
      color: #38bdf8;
    }

    .nav {
      display: flex;
      gap: 2rem;
    }

    .nav a {
      color: #94a3b8;
      font-weight: 500;
      font-size: 0.95rem;
      transition: color 0.2s ease;
      position: relative;
    }

    .nav a:hover, .nav a.active {
      color: #fff;
    }

    .nav a::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 0;
      height: 2px;
      background: #38bdf8;
      border-radius: 2px;
      transition: width 0.3s ease;
    }

    .nav a:hover::after, .nav a.active::after {
      width: 100%;
    }

    @media (max-width: 640px) {
      .nav {
        gap: 1rem;
      }
      .nav a {
        font-size: 0.85rem;
      }
    }
  `]
})
export class HeaderComponent {}
