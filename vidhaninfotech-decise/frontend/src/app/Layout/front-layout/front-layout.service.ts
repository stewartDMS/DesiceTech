import { Injectable } from '@angular/core';
import { CommonService } from 'src/app/shared/common.service';

@Injectable({
  providedIn: 'root'
})
export class FrontLayoutService {

  constructor(public commonService: CommonService) { }
  addNewData(body: any) {
    return this.commonService.post('inquiry/create', '', body, null)
  }
  addNewsLetterSubscription(body: any) {
    return this.commonService.post('newLetterSubscription/create', '', body, null)
  }
}
