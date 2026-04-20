import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-frontend-header',
  templateUrl: './frontend-header.component.html',
  styleUrls: ['./frontend-header.component.scss']
})
export class FrontendHeaderComponent implements OnInit {
  isFixed = false;

  constructor() { }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    // Add logic to determine when to fix the navigation bar
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isFixed = scrollPosition > 100; // Adjust the threshold as needed
  }

  ngOnInit(): void {
  }
}
