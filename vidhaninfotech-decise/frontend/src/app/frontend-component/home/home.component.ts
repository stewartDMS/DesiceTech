import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
// import { OwlOptions } from 'ngx-owl-carousel-o';

declare var $: any

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  appStoreUrl: string = environment.appStoreUrl;
  playStoreUrl: string = environment.playStoreUrl;
  // customOptions: OwlOptions = {
  //   loop: true,
  //   mouseDrag: false,
  //   touchDrag: false,
  //   pullDrag: false,
  //   dots: false,
  //   navSpeed: 700,
  //   navText: ['', ''],
  //   responsive: {
  //     0: {
  //       items: 1
  //     },
  //     400: {
  //       items: 2
  //     },
  //     740: {
  //       items: 3
  //     },
  //     940: {
  //       items: 4
  //     }
  //   },
  //   nav: true
  // }
  constructor() { }
  ngOnInit(): void {
    window.scrollTo(0, 0);
  }
}
