import { Component, OnInit } from '@angular/core';
import { SplitPaymentService } from '../split-payment.service';
import { CommonService } from 'src/app/shared/common.service';

@Component({
  selector: 'app-transaction-admin-list',
  templateUrl: './transaction-admin-list.component.html',
  styleUrls: ['./transaction-admin-list.component.scss']
})
export class TransactionAdminListComponent implements OnInit {

  l: number;
  p: number = 1;
  itemPerPage: any;
  adminTransactionList: any[] = [];
  allAdminTransactionList: any[] = [];
  searchTerm: any;

  constructor(public splitPaymentService: SplitPaymentService, public commonService: CommonService) { }

  ngOnInit(): void {
    this.l = this.itemPerPage = 10;
    this.splitPaymentService.adminListData.subscribe((data) => {
      if (data) {
        this.allAdminTransactionList = data;
        this.adminTransactionList = this.allAdminTransactionList;
      }
    })

    this.splitPaymentService.getTransactionAdminList('');

  }

  itemPerPageChange() {
    this.p = 1;
    this.l = parseInt(this.itemPerPage)
  }

  search() {
    this.adminTransactionList = this.allAdminTransactionList.filter((x: any) => JSON.stringify(x).toLowerCase().includes(this.searchTerm.toLowerCase()));
    this.p = 1;
  }


}
