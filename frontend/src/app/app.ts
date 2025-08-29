import { Component, signal } from '@angular/core';
import { LandingPageComponent } from './components/LandingPage/landing-page/landing-page';

@Component({
  selector: 'app-root',
  imports: [LandingPageComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('inspectia-web');
}
