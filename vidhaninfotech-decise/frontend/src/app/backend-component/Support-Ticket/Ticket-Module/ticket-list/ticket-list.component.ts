import { Component, OnInit } from '@angular/core';
import { CommonService, quenotifier } from 'src/app/shared/common.service';
import { SupportTicketService } from '../../support-ticket.service';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.scss']
})
export class TicketListComponent implements OnInit {

  l: number;
  p: number = 1;
  itemPerPage: any;
  supportTicket: any[] = [];
  allSupportTicketList: any[] = [];
  searchTerm: any;

  constructor(public supportTicketService: SupportTicketService, public commonService: CommonService) { }

  ngOnInit(): void {
    this.l = this.itemPerPage = 10;
    this.supportTicketService.supportTicketListData.subscribe((data) => {
      if (data) {
        this.allSupportTicketList = data;
        this.supportTicket = this.allSupportTicketList;
      }
    })

    this.supportTicketService.getSupportTicketAllList('');

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
