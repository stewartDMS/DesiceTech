import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from 'src/app/frontend-component/about/about.component';
import { ContactUsComponent } from 'src/app/frontend-component/contact-us/contact-us.component';
import { FeaturesComponent } from 'src/app/frontend-component/features/features.component';
import { HomeComponent } from 'src/app/frontend-component/home/home.component';
import { PlansComponent } from 'src/app/frontend-component/plans/plans.component';
import { PrivacyPolicyComponent } from 'src/app/frontend-component/privacy-policy/privacy-policy.component';
import { TermsConditionsComponent } from 'src/app/frontend-component/terms-conditions/terms-conditions.component';
import { RegisterComponent } from 'src/app/frontend-component/register/register.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'features', component: FeaturesComponent },
  { path: 'plans', component: PlansComponent },
  { path: 'contact-us', component: ContactUsComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'terms-condition', component: TermsConditionsComponent },
  { path: 'register', component: RegisterComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FrontLayoutRoutingModule { }
