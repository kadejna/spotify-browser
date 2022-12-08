import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor() {
  }

  // Clicks the log in button to be called in handtracker.component.ts
  // 1 Open Hand
  login() { 
    // declare as HTMLElement to call click()
    let button = document.getElementsByClassName("btn btn-dark")[0] as HTMLElement | null; 
    button.click();
  }

  // Clicks the browsing spotify button to be called in handtracker.component.ts
  // 2 Open Hands
  home() {
    let button = document.getElementsByClassName("browse")[0] as HTMLElement | null;
    button.click();
  }
}
