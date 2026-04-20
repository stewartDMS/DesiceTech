import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './footer/footer.component';
import { NavbarComponent } from './navbar/navbar.component';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { RouterModule } from '@angular/router';
import { PipeModule } from '../shared/pipe/pipe.module';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FrontendHeaderComponent } from './frontend-header/frontend-header.component';
import { FrontendFooterComponent } from './frontend-footer/frontend-footer.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    PipeModule,
    MatButtonModule,
    MatSidenavModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    FooterComponent,
    NavbarComponent,
    HeaderComponent,
    SidebarComponent,
    BreadcrumbComponent,
    FrontendHeaderComponent,
    FrontendFooterComponent,
  ],
  exports: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    FrontendHeaderComponent,
    FrontendFooterComponent,
    HeaderComponent,
    BreadcrumbComponent,
  ]
})
export class ComponentModule { }
