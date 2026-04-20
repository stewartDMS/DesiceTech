import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
declare var $: any;

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss']
})
export class FeaturesComponent implements OnInit, AfterViewInit {
  testimonials = [
    {
      desc: "I love how this app combines multiple features into one seamless platform. Auto payments keep my bills in check, split payments help me manage shared expenses effortlessly, and the QR code for financial goals motivates me to save consistently. The interface is clean and user-friendly, making it easy for anyone to navigate. If you want an all-in-one solution for your financial transactions, look no further.",
      star: "../../../assets/images/testimonial/4star.svg",
      name: "Jacob Leonardo",
      designation: "Designer",
      profile: "../../../assets/images/testimonial/testimonial1.svg"
    },
    {
      desc: "This app has truly transformed the way I handle payments and manage my finances. The auto-payment feature is a game-changer, ensuring my bills are paid on time without any hassle. The split payment function makes splitting expenses with friends a breeze, and the QR code feature for financial goals allows me to effortlessly contribute towards my savings. A must-have for anyone looking for a seamless and efficient payment solution.",
      star: "../../../assets/images/testimonial/5star.svg",
      name: "Tina Oliver",
      designation: "Influencer",
      profile: "../../../assets/images/testimonial/testimonial2.svg"
    }
  ];

  activeTestimonial: any;

  @ViewChild('owlCarousel') owlCarousel: ElementRef;

  constructor() { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }
  ngAfterViewInit() {
    $(this.owlCarousel.nativeElement).owlCarousel({
      items: 2,
      loop: true,
      margin: 10,
      autoplay: true,
      autoplayTimeout: 3000,
      autoplayHoverPause: false,
      responsiveClass: true,
      responsive: {
        0: {
          items: 1,
        },
        600: {
          items: 1,
        },
        1000: {
          items: 2,
        }
      }
    });
  }
}
