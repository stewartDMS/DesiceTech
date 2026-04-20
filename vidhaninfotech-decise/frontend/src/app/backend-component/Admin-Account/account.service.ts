import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from 'src/app/shared/common.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(public commonService: CommonService) { }

  accountList: any[] = [];
  private accountListDataSource = new BehaviorSubject<any>(this.accountList);
  accountListData = this.accountListDataSource.asObservable();

  getAccountAllList() {
    this.commonService.get('admin-account/all-list', '', this.commonService.getTokenWithContentTypeJSON()).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.accountList = [];
        this.accountList = Response.data;
        this.accountListDataSource.next(this.accountList)
      }
      else {
        this.accountList = [];
        this.accountListDataSource.next(this.accountList)
      }
    })
  }

  addNewData(body: any) {
    return this.commonService.post('admin-account/add', '', body, this.commonService.getTokenWithContentTypeJSON())
  }

  updateData(params: any, body: any) {
    return this.commonService.put('admin-account/update', params, body, this.commonService.getTokenWithContentTypeJSON())
  }

  getDataByID(params: any) {
    return this.commonService.get('admin-account/admin-account-data-ByID', params, this.commonService.getTokenWithContentTypeJSON())
  }

  deleteData(params: any) {
    return this.commonService.delete('admin-account/delete', params, this.commonService.getTokenWithContentTypeJSON())
  }

  setPrimaryAccount(params: any) {
    return this.commonService.get('admin-account/set-primary-account', params, this.commonService.getTokenWithContentTypeJSON())
  }

}
