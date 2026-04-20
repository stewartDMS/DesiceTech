import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from 'src/app/shared/common.service';

@Injectable({
  providedIn: 'root'
})
export class AkahuUsersService {

  constructor(public commonService: CommonService) { }

  akahuUserList: any[] = [];
  private akahuUserListDataSource = new BehaviorSubject<any>(this.akahuUserList);
  akahuUserListData = this.akahuUserListDataSource.asObservable();

  getAdminUserList() {
    this.commonService.get('akahu/users/getAllUserList', '', this.commonService.getTokenHeader()).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.akahuUserList = [];
        this.akahuUserList = Response.data;
        this.akahuUserListDataSource.next(this.akahuUserList)
      }
      else {
        this.akahuUserList = [];
        this.akahuUserListDataSource.next(this.akahuUserList)
      }
    })
  }
}
