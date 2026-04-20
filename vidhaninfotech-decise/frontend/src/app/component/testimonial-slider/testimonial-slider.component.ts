import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
declare var $: any;

@Component({
  selector: 'app-testimonial-slider',
  templateUrl: './testimonial-slider.component.html',
  styleUrls: ['./testimonial-slider.component.scss']
})
export class TestimonialSliderComponent implements OnInit, AfterViewInit {
  testimonials = [
    { img: "../../../assets/images/connects/image 1.svg" },
    { img: "../../../assets/images/connects/image 2.svg" },
    { img: "../../../assets/images/connects/image 3.svg" },
    { img: "../../../assets/images/connects/image 4.svg" },
    { img: "../../../assets/images/connects/image 5.svg" },
    { img: "../../../assets/images/connects/image 6.svg" },
  ];

  activeTestimonial: any;

  @ViewChild('owlCarousel') owlCarousel: ElementRef;

  constructor() { }

  ngOnInit() {
    this.activeTestimonial = this.testimonials[0];
  }

  ngAfterViewInit() {
    $(this.owlCarousel.nativeElement).owlCarousel({
      items: 5,
      loop: true,
      margin: 20,
      autoplay: true,
      autoplayTimeout: 3000,
      autoplayHoverPause: false,
      responsiveClass: true,
      responsive: {
        0: {
          items: 1,
        },
        600: {
          items: 3,
        },
        1000: {
          items: 5,
        }
      }
    });
  }
}
