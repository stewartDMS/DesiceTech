import { Component, OnInit } from '@angular/core';

import { CommonService, quenotifier } from 'src/app/shared/common.service';
import { SupportTicketService } from '../../support-ticket.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  l: number;
  p: number = 1;
  itemPerPage: any;
  supportTicketCategoryList: any[] = [];
  allSupportTicketCategoryList: any[] = [];
  searchTerm: any;

  constructor(public supportTicket: SupportTicketService, public commonService: CommonService) { }

  ngOnInit(): void {
    this.l = this.itemPerPage = 10;
    this.supportTicket.supportTicketCategoryListData.subscribe((data) => {
      if (data) {
        this.allSupportTicketCategoryList = data;
        this.supportTicketCategoryList = this.allSupportTicketCategoryList;
      }
    })

    this.supportTicket.getSupportTicketCategoryAllList();

  }

  itemPerPageChange() {
    this.p = 1;
    this.l = parseInt(this.itemPerPage)
  }

  search() {
    this.supportTicketCategoryList = this.allSupportTicketCategoryList.filter((x: any) => JSON.stringify(x).toLowerCase().includes(this.searchTerm.toLowerCase()));
    this.p = 1;
  }

  async delete(id: any, type: number) {
    let checkReturnType: boolean = await quenotifier('Are you sure ?', 'warning', type == 1 ? "You won't be able to active this!" : "You won't be able to deactive this!", type == 1 ? "Yes, Active it!" : "Yes, Deactive it!");

    if (checkReturnType == true) {
      this.supportTicket.deleteSupportTicketCategoryData({ id: id }).subscribe((Response: any) => {
        if (Response.meta.code == 200) {
          this.commonService.notifier('success', Response.meta.message, 2000, false);
          this.supportTicket.getSupportTicketCategoryAllList();
          this.p = 1
        }
        else {
          this.commonService.notifier('error', Response.meta.message, 2000, false);
        }
      })
    }
  }


}
