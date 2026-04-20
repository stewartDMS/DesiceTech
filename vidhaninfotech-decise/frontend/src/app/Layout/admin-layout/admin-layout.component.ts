import { Component, OnInit } from '@angular/core';
import { AdminLayoutService } from './admin-layout.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {

  constructor(public adminlayoutService: AdminLayoutService) { }

  ngOnInit(): void {
    this.adminlayoutService.checkAuthIsLogin()

    const script = document.createElement('script');
    script.src = '../../assets/js/app.min.js';
    document.body.appendChild(script);

    const script1 = document.createElement('script');
    script1.src = '../../assets/js/sidebarmenu.js';
    document.body.appendChild(script1);
  }



}
