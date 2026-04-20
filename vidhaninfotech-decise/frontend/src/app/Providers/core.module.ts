import { NgModule } from '@angular/core';
//import { ToastrModule } from 'ngx-toastr';

import { CoreInterceptorModule } from './core-interceptor/core-interceptor.module';


@NgModule({
  declarations: [],
  imports: [
    CoreInterceptorModule,
  ]
})
export class CoreModule { }
