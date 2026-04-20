import { Component, OnInit } from '@angular/core';
import { MonitizationService } from '../monitization.service';
import { CommonService, quenotifier } from 'src/app/shared/common.service';

@Component({
  selector: 'app-monitization-list',
  templateUrl: './monitization-list.component.html',
  styleUrls: ['./monitization-list.component.scss']
})
export class MonitizationListComponent implements OnInit {

  l: number;
  p: number = 1;
  itemPerPage: any;
  monitizationList: any[] = [];
  allMonitizationList: any[] = [];
  searchTerm: any;

  constructor(public monitizationService: MonitizationService, public commonService: CommonService) { }

  ngOnInit(): void {
    this.l = this.itemPerPage = 10;
    this.monitizationService.monitizationListData.subscribe((data) => {
      if (data) {
        this.allMonitizationList = data;
        this.monitizationList = this.allMonitizationList;
      }
    })

    this.monitizationService.getMonitizationAllList();

  }

  itemPerPageChange() {
    this.p = 1;
    this.l = parseInt(this.itemPerPage)
  }

  search() {
    this.monitizationList = this.allMonitizationList.filter((x: any) => JSON.stringify(x).toLowerCase().includes(this.searchTerm.toLowerCase()));
    this.p = 1;
  }

  async delete(id: any) {
    let checkReturnType: boolean = await quenotifier('Are you sure ?', 'warning', "You won't be able to revert this!", "Yes, Delete it!");

    if (checkReturnType == true) {
      this.monitizationService.deleteData({ id: id }).subscribe((Response: any) => {
        if (Response.meta.code == 200) {
          this.commonService.notifier('success', 'Removed Successfully.', 2000, false);
          this.monitizationService.getMonitizationAllList();
          this.p = 1
        }
      })
    }
  }


}
