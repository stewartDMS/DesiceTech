import { Injectable } from '@angular/core';
import {
  HttpResponse,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoaderService } from './loader.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize, tap } from 'rxjs/operators';
@Injectable()
export class InterceptorService implements HttpInterceptor {
  private requests: HttpRequest<any>[] = [];
  constructor(private loaderService: LoaderService, private spinner: NgxSpinnerService,) { }
  count = 0;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (req.url.includes('notification/viewedNotifications') || req.url.includes('notification/getAdminNotification')) {
      return next.handle(req)
    }
    else {
      this.spinner.show()
      this.count++;
      return next.handle(req)

        .pipe(tap(

          event => console.log(),

          error => console.log(error)

        ), finalize(() => {

          this.count--;

          if (this.count == 0) this.spinner.hide()
        })
        );


    }
  }
}