import { Component, OnInit } from '@angular/core';
import { CommonService, quenotifier } from 'src/app/shared/common.service';
import { CategoryService } from '../category.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  l: number;
  p: number = 1;
  itemPerPage: any;
  paymentCategoryList: any[] = [];
  allPaymentCategoryList: any[] = [];
  searchTerm: any;

  constructor(public categoryService: CategoryService, public commonService: CommonService) { }

  ngOnInit(): void {
    this.l = this.itemPerPage = 10;
    this.categoryService.paymentCategoryListData.subscribe((data) => {
      if (data) {
        this.allPaymentCategoryList = data;
        this.paymentCategoryList = this.allPaymentCategoryList;
      }
    })

    this.categoryService.getPaymentCategoryAllList();

  }

  itemPerPageChange() {
    this.p = 1;
    this.l = parseInt(this.itemPerPage)
  }

  search() {
    this.paymentCategoryList = this.allPaymentCategoryList.filter((x: any) => JSON.stringify(x).toLowerCase().includes(this.searchTerm.toLowerCase()));
    this.p = 1;
  }

  async delete(id: any, type: number) {
    let checkReturnType: boolean = await quenotifier('Are you sure ?', 'warning', type == 1 ? "You won't be able to active this!" : "You won't be able to deactive this!", type == 1 ? "Yes, Active it!" : "Yes, Deactive it!");

    if (checkReturnType == true) {
      this.categoryService.deleteData({ id: id }).subscribe((Response: any) => {
        if (Response.meta.code == 200) {
          this.commonService.notifier('success', Response.meta.message, 2000, false);
          this.categoryService.getPaymentCategoryAllList();
          this.p = 1
        }
      })
    }
  }


}
