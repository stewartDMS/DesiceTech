import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './Layout/admin-layout/admin-layout.component';
import { LoginLayoutComponent } from './Layout/login-layout/login-layout.component';
import { DatePipe } from '@angular/common';
import { LoaderService } from './Providers/core-interceptor/loader.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { InterceptorService } from './Providers/core-interceptor/core-interceptor.service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { RouterModule } from '@angular/router';
import { ComponentModule } from './component/component.module';
import { DirectivesModule } from './shared/directives/directives.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FrontLayoutComponent } from './Layout/front-layout/front-layout.component';
@NgModule({
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    LoginLayoutComponent,
    FrontLayoutComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxSpinnerModule,
    RouterModule,
    ComponentModule,
    BrowserAnimationsModule,
    DirectivesModule,
  ],
  providers: [DatePipe, LoaderService,
    {
      provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
