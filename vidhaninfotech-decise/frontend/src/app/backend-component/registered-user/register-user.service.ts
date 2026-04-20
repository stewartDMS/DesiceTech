import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from 'src/app/shared/common.service';

@Injectable({
  providedIn: 'root'
})
export class RegisterUserService {
  registerUserList: any[] = [];
  private registerUserListDataSource = new BehaviorSubject<any>(this.registerUserList);
  registerUserListData = this.registerUserListDataSource.asObservable();

  constructor(public commonService: CommonService) { }
  getRegisterAllList() {
    this.commonService.get('inquiry/all-list', '', this.commonService.getTokenHeader()).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.registerUserList = [];
        Response.data.map((x: any) => {
          x.createdAt = new Date(x.createdAt)
        })
        this.registerUserList = Response.data.sort((a: any, b: any) => b.createdAt - a.createdAt);
        this.registerUserListDataSource.next(this.registerUserList)
      }
      else {
        this.registerUserList = [];
        this.registerUserListDataSource.next(this.registerUserList)
      }
    })
  }
}
