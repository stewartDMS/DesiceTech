import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from 'src/app/shared/common.service';

@Injectable({
  providedIn: 'root'
})
export class SplitPaymentService {

  constructor(public commonService: CommonService) { }

  splitPayment: any[] = [];
  private splitPaymentDataSource = new BehaviorSubject<any>(this.splitPayment);
  splitPaymentData = this.splitPaymentDataSource.asObservable();

  getSplitPaymentData(params: any) {
    this.commonService.get('split-payment/all-list-fAdmin', params, this.commonService.getTokenHeader()).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.splitPayment = [];
        this.splitPayment = Response.data;
        this.splitPaymentDataSource.next(this.splitPayment)
      }
      else {
        this.splitPayment = [];
        this.splitPaymentDataSource.next(this.splitPayment)
      }
    })
  }

  adminList: any[] = [];
  private adminListDataSource = new BehaviorSubject<any>(this.adminList);
  adminListData = this.adminListDataSource.asObservable();

  getTransactionAdminList(params: any) {
    this.commonService.get('split-payment/admin-transactions', params, this.commonService.getTokenHeader()).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.adminList = [];
        this.adminList = Response.data;
        this.adminListDataSource.next(this.adminList)
      }
      else {
        this.adminList = [];
        this.adminListDataSource.next(this.adminList)
      }
    })
  }

  userList: any[] = [];
  private userListDataSource = new BehaviorSubject<any>(this.userList);
  userListData = this.userListDataSource.asObservable();

  getTransactionUserList(params: any) {
    this.commonService.get('split-payment/user-transactions', params, this.commonService.getTokenHeader()).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.userList = [];
        this.userList = Response.data;
        this.userListDataSource.next(this.userList)
      }
      else {
        this.userList = [];
        this.userListDataSource.next(this.userList)
      }
    })
  }
}
