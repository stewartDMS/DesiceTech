import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/shared/common.service';
import { CategoryService } from '../category.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {

  submittedData: boolean = false;
  isEdit: boolean = false;
  paymentCategoryForm: FormGroup;
  get fpaymentCategoryData() { return this.paymentCategoryForm.controls; }
  pCID: any

  constructor(public fb: FormBuilder, public categoryService: CategoryService, public router: Router, public commonService: CommonService, public route: ActivatedRoute) {
    if (router.url.includes('payment/category/update')) {
      route.params.subscribe((x: any) => {
        this.pCID = x.id;
        this.isEdit = true;
      })
    }
    else {
      this.isEdit = false;
    }
  }

  ngOnInit(): void {
    this.defaultForm();
    if (this.isEdit == true) {
      this.edit();
    }
  }

  defaultForm() {
    this.paymentCategoryForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required]],
      akahuGroupId: [''],
    })
  }

  replyData: any = '';

  edit() {
    this.categoryService.getDataByID({ id: this.pCID }).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.paymentCategoryForm.controls['id'].setValue(Response.data.id);
        this.paymentCategoryForm.controls['name'].setValue(Response.data.name);
        this.paymentCategoryForm.controls['akahuGroupId'].setValue(Response.data.akahuGroupId);
      }
    })
  }

  save() {
    if (this.paymentCategoryForm.invalid) {
      this.submittedData = true;
      return;
    }

    // let obj = {
    //   minAmount: this.paymentCategoryForm.value.minAmount,
    // }
    let obj: FormData = new FormData();
    obj.append("name", this.paymentCategoryForm.value.name);
    obj.append("akahuGroupId", this.paymentCategoryForm.value.akahuGroupId);


    this.categoryService.addNewData(obj).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.defaultForm();
        this.submittedData = false;
        this.router.navigateByUrl('/admin/payment/category/list');
        this.commonService.notifier('success', 'Data Saved Successfully.', 2000, false);
      }
      else {
        this.commonService.notifier('error', Response.meta.message, 2000, false)
      }
    })
  }

  update() {
    if (this.paymentCategoryForm.invalid) {
      this.submittedData = true;
      return;
    }

    let obj: FormData = new FormData();
    obj.append("name", this.paymentCategoryForm.value.name);
    obj.append("akahuGroupId", this.paymentCategoryForm.value.akahuGroupId);

    this.categoryService.updateData({ id: this.pCID }, obj).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.defaultForm();
        this.submittedData = false;
        this.router.navigateByUrl('/admin/payment/category/list');
        this.commonService.notifier('success', 'Data Updated.', 2000, false);
      }
      else {
        this.commonService.notifier('error', Response.meta.message, 2000, false)
      }
    })
  }


}
