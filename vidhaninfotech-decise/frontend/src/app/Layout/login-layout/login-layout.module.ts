import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginLayoutRoutingModule } from './login-layout-routing.module';
import { LoginPageComponent } from 'src/app/login-component/login-page/login-page.component';
import { DirectivesModule } from 'src/app/shared/directives/directives.module';
import { PipeModule } from 'src/app/shared/pipe/pipe.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgOtpInputModule } from 'ng-otp-input';


@NgModule({
  declarations: [
    LoginPageComponent,
  ],
  imports: [
    CommonModule,
    LoginLayoutRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    DirectivesModule,
    PipeModule,
    NgOtpInputModule
  ]
})
export class LoginLayoutModule { }
