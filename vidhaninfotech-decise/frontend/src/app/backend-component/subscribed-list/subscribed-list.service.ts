import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from 'src/app/shared/common.service';

@Injectable({
  providedIn: 'root'
})
export class SubscribedListService {
  subscribedList: any[] = [];
  private subscribedListDataSource = new BehaviorSubject<any>(this.subscribedList);
  subscribedListData = this.subscribedListDataSource.asObservable();

  constructor(public commonService: CommonService) { }
  getNewLetterSubscriptionList() {
    this.commonService.get('newLetterSubscription/all-list', '', this.commonService.getTokenHeader()).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.subscribedList = [];
        Response.data.map((x: any) => {
          x.subscriptionDate = new Date(x.subscriptionDate)
        })
        this.subscribedList = Response.data.sort((a: any, b: any) => b.subscriptionDate - a.subscriptionDate);
        this.subscribedListDataSource.next(this.subscribedList)
      }
      else {
        this.subscribedList = [];
        this.subscribedListDataSource.next(this.subscribedList)
      }
    })
  }
}
