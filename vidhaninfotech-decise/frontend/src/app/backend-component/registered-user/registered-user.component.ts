import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/shared/common.service';
import { RegisterUserService } from './register-user.service';

@Component({
  selector: 'app-registered-user',
  templateUrl: './registered-user.component.html',
  styleUrls: ['./registered-user.component.scss']
})
export class RegisteredUserComponent implements OnInit {
  l: number;
  p: number = 1;
  itemPerPage: any;
  registeruserList: any[] = [];
  allRegisteruserList: any[] = [];
  searchTerm: any;

  constructor(public RegisterUserService: RegisterUserService, public commonService: CommonService) { }

  ngOnInit(): void {
    this.l = this.itemPerPage = 10;
    this.RegisterUserService.registerUserListData.subscribe((data) => {
      if (data) {
        this.allRegisteruserList = data;
        this.registeruserList = this.allRegisteruserList;
      }
    })

    this.RegisterUserService.getRegisterAllList();

  }
  search() {
    this.registeruserList = this.allRegisteruserList.filter((x: any) => JSON.stringify(x).toLowerCase().includes(this.searchTerm.toLowerCase()));
    this.p = 1;
  }
  selectAllRows(event: any) {
    const isChecked = event.target.checked;
    const rowCheckboxes = document.querySelectorAll('tbody input[type="checkbox"]');
    rowCheckboxes.forEach((checkbox: any) => {
      checkbox.checked = isChecked;
    });
  }
}
