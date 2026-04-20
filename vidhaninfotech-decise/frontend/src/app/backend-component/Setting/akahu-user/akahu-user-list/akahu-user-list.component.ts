import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/shared/common.service';
import { AkahuUsersService } from './akahu-users.service';

@Component({
  selector: 'app-akahu-user-list',
  templateUrl: './akahu-user-list.component.html',
  styleUrls: ['./akahu-user-list.component.scss']
})
export class AkahuUserListComponent implements OnInit {

  l: number;
  p: number = 1;
  itemPerPage: any;
  akahuUserList: any[] = [];
  allAdminUserList: any[] = [];
  searchTerm: any;

  constructor(public akahuUsersService: AkahuUsersService, public commonService: CommonService) { }

  ngOnInit(): void {
    this.l = this.itemPerPage = 10;
    this.akahuUsersService.akahuUserListData.subscribe((data) => {
      if (data) {
        this.allAdminUserList = data;
        this.akahuUserList = this.allAdminUserList;
      }
    })

    this.akahuUsersService.getAdminUserList();

  }

  itemPerPageChange() {
    this.p = 1;
    this.l = parseInt(this.itemPerPage)
  }

  search() {
    this.akahuUserList = this.allAdminUserList.filter((x: any) => JSON.stringify(x).toLowerCase().includes(this.searchTerm.toLowerCase()));
    this.p = 1;
  }

}
