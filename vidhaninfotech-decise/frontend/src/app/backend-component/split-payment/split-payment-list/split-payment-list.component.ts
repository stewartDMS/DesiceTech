import { Component, OnInit } from '@angular/core';
import { CommonService, quenotifier } from 'src/app/shared/common.service';
import { SplitPaymentService } from '../split-payment.service';

@Component({
  selector: 'app-split-payment-list',
  templateUrl: './split-payment-list.component.html',
  styleUrls: ['./split-payment-list.component.scss']
})
export class SplitPaymentListComponent implements OnInit {

  l: number;
  p: number = 1;
  itemPerPage: any;
  supportTicket: any[] = [];
  allSupportTicketList: any[] = [];
  searchTerm: any;

  constructor(public splitPaymentService: SplitPaymentService, public commonService: CommonService) { }

  ngOnInit(): void {
    this.l = this.itemPerPage = 10;
    this.splitPaymentService.splitPaymentData.subscribe((data) => {
      if (data) {
        this.allSupportTicketList = data;
        this.supportTicket = this.allSupportTicketList;
      }
    })

    this.splitPaymentService.getSplitPaymentData('');

  }

  itemPerPageChange() {
    this.p = 1;
    this.l = parseInt(this.itemPerPage)
  }

  search() {
    this.supportTicket = this.allSupportTicketList.filter((x: any) => JSON.stringify(x).toLowerCase().includes(this.searchTerm.toLowerCase()));
    this.p = 1;
  }

}
