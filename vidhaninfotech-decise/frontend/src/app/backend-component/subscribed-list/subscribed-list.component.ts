import { Component, OnInit } from '@angular/core';
import { SubscribedListService } from './subscribed-list.service';
import { CommonService } from 'src/app/shared/common.service';

@Component({
  selector: 'app-subscribed-list',
  templateUrl: './subscribed-list.component.html',
  styleUrls: ['./subscribed-list.component.scss']
})
export class SubscribedListComponent implements OnInit {
  l: number;
  p: number = 1;
  itemPerPage: any;
  subscribedList: any[] = [];
  allSubscribedList: any[] = [];
  searchTerm: any;

  constructor(public SubscribedListService: SubscribedListService, public commonService: CommonService) { }


  ngOnInit(): void {
    this.l = this.itemPerPage = 10;
    this.SubscribedListService.subscribedListData.subscribe((data) => {
      if (data) {
        this.allSubscribedList = data;
        this.subscribedList = this.allSubscribedList;
      }
    })

    this.SubscribedListService.getNewLetterSubscriptionList();

  }
  search() {
    this.subscribedList = this.allSubscribedList.filter((x: any) => JSON.stringify(x).toLowerCase().includes(this.searchTerm.toLowerCase()));
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
