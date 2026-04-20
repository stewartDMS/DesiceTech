import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from 'src/app/shared/common.service';

@Injectable({
  providedIn: 'root'
})
export class FinancialGoalsService {

  constructor(public commonService: CommonService) { }

  financialGoalList: any[] = [];
  private financialGoalListDataSource = new BehaviorSubject<any>(this.financialGoalList);
  financialGoalListData = this.financialGoalListDataSource.asObservable();

  getFinancialGoalAllList() {
    this.commonService.get('financialGoals/all-list', '', this.commonService.getTokenHeader()).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.financialGoalList = [];
        Response.data.map((x: any) => {
          x.group = x?.group == 1 ? 'Debt' : x?.group == 2 ? 'Savings' : x?.group == 3 ? 'Invest' :
            x?.group == 4 ? 'Billings' : ''
        })
        this.financialGoalList = Response.data;
        this.financialGoalListDataSource.next(this.financialGoalList)
      }
      else {
        this.financialGoalList = [];
        this.financialGoalListDataSource.next(this.financialGoalList)
      }
    })
  }

  addNewData(body: any) {
    return this.commonService.post('financialGoals/create', '', body, this.commonService.getTokenHeader())
  }

  updateData(params: any, body: any) {
    return this.commonService.put('financialGoals/update', params, body, this.commonService.getTokenHeader())
  }

  getDataByID(params: any) {
    return this.commonService.get('financialGoals/financialGoals-data-ByID', params, this.commonService.getTokenWithContentTypeJSON())
  }

  deleteData(params: any) {
    return this.commonService.delete('financialGoals/activeDeactive', params, this.commonService.getTokenWithContentTypeJSON())
  }

}
