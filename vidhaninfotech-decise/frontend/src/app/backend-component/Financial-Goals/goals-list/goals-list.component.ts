import { Component, OnInit } from '@angular/core';
import { CommonService, quenotifier } from 'src/app/shared/common.service';
import { FinancialGoalsService } from '../financial-goals.service';

@Component({
  selector: 'app-goals-list',
  templateUrl: './goals-list.component.html',
  styleUrls: ['./goals-list.component.scss']
})
export class GoalsListComponent implements OnInit {

  l: number;
  p: number = 1;
  itemPerPage: any;
  financialGoalList: any[] = [];
  allFinancialGoalList: any[] = [];
  searchTerm: any;

  constructor(public financialGoalsService: FinancialGoalsService, public commonService: CommonService) { }

  ngOnInit(): void {
    this.l = this.itemPerPage = 10;
    this.financialGoalsService.financialGoalListData.subscribe((data) => {
      if (data) {
        this.allFinancialGoalList = data;
        this.financialGoalList = this.allFinancialGoalList;
      }
    })

    this.financialGoalsService.getFinancialGoalAllList();

  }

  itemPerPageChange() {
    this.p = 1;
    this.l = parseInt(this.itemPerPage)
  }

  search() {
    this.financialGoalList = this.allFinancialGoalList.filter((x: any) => JSON.stringify(x).toLowerCase().includes(this.searchTerm.toLowerCase()));
    this.p = 1;
  }

  async delete(id: any, type: number) {
    let checkReturnType: boolean = await quenotifier('Are you sure ?', 'warning', type == 2 ? "You won't be able to deactive this!" : "You won't be able to active this!", type == 2 ? "Yes, Deactive it!" : "Yes, Active it!");

    if (checkReturnType == true) {
      this.financialGoalsService.deleteData({ id: id }).subscribe((Response: any) => {
        if (Response.meta.code == 200) {
          this.commonService.notifier('success', Response.meta.message, 2000, false);
          this.financialGoalsService.getFinancialGoalAllList();
          this.p = 1
        }
      })
    }
  }


}
