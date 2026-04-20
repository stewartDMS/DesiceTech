import { Component, OnInit } from '@angular/core';
import { SplitPaymentService } from '../split-payment.service';
import { CommonService } from 'src/app/shared/common.service';

@Component({
  selector: 'app-transaction-user-list',
  templateUrl: './transaction-user-list.component.html',
  styleUrls: ['./transaction-user-list.component.scss']
})
export class TransactionUserListComponent implements OnInit {

  l: number;
  p: number = 1;
  itemPerPage: any;
  userTransactionList: any[] = [];
  allUserTransactionList: any[] = [];
  searchTerm: any;
  isActive: any;
  platformFeesList: any;
  constructor(public splitPaymentService: SplitPaymentService, public commonService: CommonService) { }

  ngOnInit(): void {
    this.l = this.itemPerPage = 10;
    this.splitPaymentService.userListData.subscribe((data) => {
      if (data) {
        data.map((x: any) => {
          x.expand = false;
        })
        this.allUserTransactionList = data;
        this.userTransactionList = this.allUserTransactionList;
      }
    })
    this.splitPaymentService.getTransactionUserList('');
  }
  expand(index: number) {
    this.userTransactionList[index].expand = !this.userTransactionList[index].expand
  }

  itemPerPageChange() {
    this.p = 1;
    this.l = parseInt(this.itemPerPage)
  }

  search() {
    this.userTransactionList = this.allUserTransactionList.filter((x: any) => JSON.stringify(x).toLowerCase().includes(this.searchTerm.toLowerCase()));
    this.p = 1;
  }


}
