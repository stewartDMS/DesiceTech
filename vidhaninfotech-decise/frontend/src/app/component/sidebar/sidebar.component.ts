import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CommonService } from 'src/app/shared/common.service';
declare var $: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnInit {

  showFiller: boolean = false;

  constructor(public router: Router, public commonService: CommonService) {

  }

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const script1 = document.createElement('script');
        script1.src = '../../../assets/js/customSidebar.js';
        document.body.appendChild(script1);
      }
    });
  }

}
