import { Component, OnInit } from '@angular/core';
import { CommonService, quenotifier } from 'src/app/shared/common.service';
import { AdminUserService } from '../admin-user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

  l: number;
  p: number = 1;
  itemPerPage: any;
  adminUserList: any[] = [];
  allAdminUserList: any[] = [];
  searchTerm: any;

  constructor(public adminUserService: AdminUserService, public commonService: CommonService) { }

  ngOnInit(): void {
    this.l = this.itemPerPage = 10;
    this.adminUserService.adminUserListData.subscribe((data) => {
      if (data) {
        this.allAdminUserList = data;
        this.adminUserList = this.allAdminUserList;
      }
    })

    this.adminUserService.getAdminUserList();

  }

  itemPerPageChange() {
    this.p = 1;
    this.l = parseInt(this.itemPerPage)
  }

  search() {
    this.adminUserList = this.allAdminUserList.filter((x: any) => JSON.stringify(x).toLowerCase().includes(this.searchTerm.toLowerCase()));
    this.p = 1;
  }

  async delete(id: any) {
    let checkReturnType: boolean = await quenotifier('Are you sure ?', 'warning', "You won't be able to revert this!", "Yes, Delete it!");

    if (checkReturnType == true) {
      this.adminUserService.deleteData({ id: id }).subscribe((Response: any) => {
        if (Response.meta.code == 200) {
          this.commonService.notifier('success', 'Removed Successfully.', 2000, false);
          this.adminUserService.getAdminUserList();
          this.p = 1
        }
      })
    }
  }


}
