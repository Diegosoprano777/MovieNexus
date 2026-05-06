import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  template: `
    <div class="hero-container">
      <div class="hero-content">
        <h1 class="hero-title">
          Bienvenido a <span class="gradient-text">MovieNexus</span>
        </h1>
        <p class="hero-subtitle">
          Explora las películas más populares, busca tus favoritas y mantente al día con los últimos estrenos.
        </p>
        <button class="hero-button">Empezar a Explorar</button>
      </div>
    </div>
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

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class HomeComponent {}
