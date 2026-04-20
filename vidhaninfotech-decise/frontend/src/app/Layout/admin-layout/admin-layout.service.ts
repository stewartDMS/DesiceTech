import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { CommonService, StorageKey } from 'src/app/shared/common.service';

@Injectable({
  providedIn: 'root'
})
export class AdminLayoutService {

  constructor(public commonService: CommonService, public router: Router) { }

  checkAuthIsLogin() {
    let data = this.commonService.getValue(StorageKey.loginData);
    if (!data || data.isLogin != true) {
      this.router.navigateByUrl('/login')
    }
  }

  getHomeCount() {
    return this.commonService.get('split-payment/count', '', this.commonService.getTokenWithContentTypeJSON())
  }
  monthwiseEarlingCounts() {
    return this.commonService.get('transaction/monthlyEarnings', '', this.commonService.getTokenWithContentTypeJSON())
  }
  yearlyEarlingCounts() {
    return this.commonService.get('transaction/lastthreeYearEarnings', '', this.commonService.getTokenWithContentTypeJSON())
  }
  revenueExpenseCounts(params: any) {
    return this.commonService.get('transaction/revenuseUpdate', params, this.commonService.getTokenWithContentTypeJSON())
  }
  monthYearList() {
    return this.commonService.get('transaction/monthYearList', '', this.commonService.getTokenWithContentTypeJSON())
  }


  notificationList: any[] = [];
  private notificationListDataSource = new BehaviorSubject<any>(this.notificationList);
  notificationListData = this.notificationListDataSource.asObservable();

  getNotificationListData(params: any) {
    this.commonService.get('notification/getAdminNotification', params, this.commonService.getTokenWithContentTypeJSON()).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.notificationList = [];
        console.log(Response.data);
        this.notificationList = Response.data.notifications;
        this.notificationListDataSource.next(this.notificationList);
      }
      else {
        this.notificationList = [];
        this.notificationListDataSource.next(this.notificationList);
      }
    })
  }
  viewAllNotification() {
    return this.commonService.get('notification/viewedNotifications', '', this.commonService.getTokenWithContentTypeJSON())
  }

}
