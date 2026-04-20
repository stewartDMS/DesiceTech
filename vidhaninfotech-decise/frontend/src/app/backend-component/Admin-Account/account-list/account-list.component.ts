import { Component, OnInit } from '@angular/core';
import { CommonService, quenotifier } from 'src/app/shared/common.service';
import { AccountService } from '../account.service';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss']
})
export class AccountListComponent implements OnInit {

  l: number;
  p: number = 1;
  itemPerPage: any;
  accountList: any[] = [];
  allAccountList: any[] = [];
  searchTerm: any;

  constructor(public accountService: AccountService, public commonService: CommonService) { }

  ngOnInit(): void {
    this.l = this.itemPerPage = 10;
    this.accountService.accountListData.subscribe((data) => {
      if (data) {
        this.allAccountList = data;
        this.accountList = this.allAccountList;
      }
    })

    this.accountService.getAccountAllList();

  }

  itemPerPageChange() {
    this.p = 1;
    this.l = parseInt(this.itemPerPage)
  }

  search() {
    this.accountList = this.allAccountList.filter((x: any) => JSON.stringify(x).toLowerCase().includes(this.searchTerm.toLowerCase()));
    this.p = 1;
  }

  async delete(id: any) {
    let checkReturnType: boolean = await quenotifier('Are you sure ?', 'warning', "You won't be able to revert this!", "Yes, Delete it!");

    if (checkReturnType == true) {
      this.accountService.deleteData({ id: id }).subscribe((Response: any) => {
        if (Response.meta.code == 200) {
          this.commonService.notifier('success', 'Removed Successfully.', 2000, false);
          this.accountService.getAccountAllList();
          this.p = 1
        }
      })
    }
  }

  async setAsPrimary(id: any) {
    let checkReturnType: boolean = await quenotifier('Are you sure ?', 'warning', "You won't be able to set as Primary Account!", "Yes, Set it!");

    if (checkReturnType == true) {
      this.accountService.setPrimaryAccount({ id: id }).subscribe((Response: any) => {
        if (Response.meta.code == 200) {
          this.commonService.notifier('success', 'Account set as Primary.', 2000, false);
          this.accountService.getAccountAllList();
          this.p = 1
        }
      })
    }
  }


}