import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FrontLayoutRoutingModule } from './front-layout-routing.module';
import { HomeComponent } from 'src/app/frontend-component/home/home.component';
import { AboutComponent } from 'src/app/frontend-component/about/about.component';
import { PrivacyPolicyComponent } from 'src/app/frontend-component/privacy-policy/privacy-policy.component';
import { TermsConditionsComponent } from 'src/app/frontend-component/terms-conditions/terms-conditions.component';
import { FeaturesComponent } from 'src/app/frontend-component/features/features.component';
import { PlansComponent } from 'src/app/frontend-component/plans/plans.component';
import { ContactUsComponent } from 'src/app/frontend-component/contact-us/contact-us.component';
import { TestimonialSliderComponent } from 'src/app/component/testimonial-slider/testimonial-slider.component';
import { RegisterComponent } from 'src/app/frontend-component/register/register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    HomeComponent,
    AboutComponent,
    PrivacyPolicyComponent,
    TermsConditionsComponent,
    FeaturesComponent,
    PlansComponent,
    ContactUsComponent,
    TestimonialSliderComponent,
    RegisterComponent
  ],
  imports: [
    CommonModule,
    FrontLayoutRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule
  ],
  exports : [
    TestimonialSliderComponent
  ]
})
export class FrontLayoutModule { }
