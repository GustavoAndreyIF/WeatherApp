import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./components/layout/header/header";
import { CurrentWeatherCard } from "./components/weather/current-weather-card/current-weather-card";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, CurrentWeatherCard],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('WeatherApp');
}
