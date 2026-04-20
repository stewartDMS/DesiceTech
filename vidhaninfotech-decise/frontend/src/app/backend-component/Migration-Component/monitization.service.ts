import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from 'src/app/shared/common.service';

@Injectable({
  providedIn: 'root'
})
export class MonitizationService {

  constructor(public commonService: CommonService) { }

  monitizationList: any[] = [];
  private monitizationListDataSource = new BehaviorSubject<any>(this.monitizationList);
  monitizationListData = this.monitizationListDataSource.asObservable();

  getMonitizationAllList() {
    this.commonService.get('monitization/all-list', '', this.commonService.getTokenHeader()).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.monitizationList = [];
        Response.data.map((x: any) => {
          x.paymentType = x.paymentType == 1 ? 'Auto' : 'Manual'
        })
        this.monitizationList = Response.data;
        this.monitizationListDataSource.next(this.monitizationList)
      }
      else {
        this.monitizationList = [];
        this.monitizationListDataSource.next(this.monitizationList)
      }
    })
  }

  addNewData(body: any) {
    return this.commonService.post('monitization/add', '', body, this.commonService.getTokenHeader())
  }

  updateData(params: any, body: any) {
    return this.commonService.put('monitization/update', params, body, this.commonService.getTokenHeader())
  }

  getDataByID(params: any) {
    return this.commonService.get('monitization/monitization-data-ByID', params, this.commonService.getTokenWithContentTypeJSON())
  }

  deleteData(params: any) {
    return this.commonService.delete('monitization/delete', params, this.commonService.getTokenWithContentTypeJSON())
  }

}
