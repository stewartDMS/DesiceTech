import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from 'src/app/shared/common.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(public commonService: CommonService) { }

  paymentCategoryList: any[] = [];
  private paymentCategoryListDataSource = new BehaviorSubject<any>(this.paymentCategoryList);
  paymentCategoryListData = this.paymentCategoryListDataSource.asObservable();

  getPaymentCategoryAllList() {
    this.commonService.get('split-payment/category/all-list', '', this.commonService.getTokenHeader()).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.paymentCategoryList = [];
        Response.data.map((x: any) => {
          x.paymentType = x.paymentType == 1 ? 'Auto' : 'Manual'
        })
        this.paymentCategoryList = Response.data;
        this.paymentCategoryListDataSource.next(this.paymentCategoryList)
      }
      else {
        this.paymentCategoryList = [];
        this.paymentCategoryListDataSource.next(this.paymentCategoryList)
      }
    })
  }

  addNewData(body: any) {
    return this.commonService.post('split-payment/category/create', '', body, this.commonService.getTokenHeader())
  }

  updateData(params: any, body: any) {
    return this.commonService.put('split-payment/category/update', params, body, this.commonService.getTokenHeader())
  }

  getDataByID(params: any) {
    return this.commonService.get('split-payment/category/dataget-byID', params, this.commonService.getTokenWithContentTypeJSON())
  }

  deleteData(params: any) {
    return this.commonService.get('split-payment/category/active-deactive', params, this.commonService.getTokenWithContentTypeJSON())
  }

}
