import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from 'src/app/shared/common.service';

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {

  constructor(public commonService: CommonService) { }

  adminUserList: any[] = [];
  private adminUserListDataSource = new BehaviorSubject<any>(this.adminUserList);
  adminUserListData = this.adminUserListDataSource.asObservable();

  getAdminUserList() {
    this.commonService.get('adminAuth/getAll-AdminUser-List', '', this.commonService.getTokenHeader()).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.adminUserList = [];
        Response.data.map((x: any) => {
          x.role = x.role == 1 ? 'Super Admin' : x.role == 2 ? 'Admin' : 'other'
        })
        this.adminUserList = Response.data;
        this.adminUserListDataSource.next(this.adminUserList)
      }
      else {
        this.adminUserList = [];
        this.adminUserListDataSource.next(this.adminUserList)
      }
    })
  }

  addNewData(body: any) {
    return this.commonService.post('adminAuth/register', '', body, this.commonService.getTokenHeader())
  }

  updateData(params: any, body: any) {
    return this.commonService.put('adminAuth/update-user-details', params, body, this.commonService.getTokenHeader())
  }

  getDataByID(params: any) {
    return this.commonService.get('adminAuth/getAdminUser-details-byID', params, this.commonService.getTokenWithContentTypeJSON())
  }

  deleteData(params: any) {
    return this.commonService.delete('monitization/delete', params, this.commonService.getTokenWithContentTypeJSON())
  }

}
