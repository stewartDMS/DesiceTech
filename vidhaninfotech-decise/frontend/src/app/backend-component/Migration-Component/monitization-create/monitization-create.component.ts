import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MonitizationService } from '../monitization.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/shared/common.service';

@Component({
  selector: 'app-monitization-create',
  templateUrl: './monitization-create.component.html',
  styleUrls: ['./monitization-create.component.scss']
})
export class MonitizationCreateComponent implements OnInit {

  submittedData: boolean = false;
  isEdit: boolean = false;
  paymentType: any[] = [
    { name: 'Auto', value: 1 },
    { name: 'Manual', value: 2 }
  ]
  paymentModeList: any[] = [
    { name: 'Amount', value: 1 },
    { name: 'Percentage', value: 2 }

  ]
  monitizationForm: FormGroup;
  get fMonitizationData() { return this.monitizationForm.controls; }
  mID: any

  constructor(public fb: FormBuilder, public monitizationService: MonitizationService, public router: Router, public commonService: CommonService, public route: ActivatedRoute) {
    if (router.url.includes('monitization-list/update')) {
      route.params.subscribe((x: any) => {
        this.mID = x.id;
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
    this.monitizationForm = this.fb.group({
      id: [''],
      minAmount: ['', [Validators.required]],
      maxAmount: ['', [Validators.required]],
      percentage: [''],
      description: [''],
      amount: [''],
      paymentMode: [null, [Validators.required]],
      paymentType: [null, [Validators.required]]
    })
  }

  changeMode() {
    if (this.monitizationForm.value.paymentMode == 1) {
      this.monitizationForm.get('amount').setValidators([Validators.required])
      this.monitizationForm.get('amount').updateValueAndValidity();
      this.monitizationForm.get('percentage').clearValidators();
      this.monitizationForm.get('percentage').updateValueAndValidity();
      this.monitizationForm.controls['percentage'].setValue('');

    }
    else {
      this.monitizationForm.get('percentage').setValidators([Validators.required])
      this.monitizationForm.get('percentage').updateValueAndValidity();
      this.monitizationForm.get('amount').clearValidators();
      this.monitizationForm.controls['amount'].setValue('');
      this.monitizationForm.get('amount').updateValueAndValidity();
    }
  }

  edit() {
    this.monitizationService.getDataByID({ id: this.mID }).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.monitizationForm.controls['id'].setValue(Response.data.id);
        this.monitizationForm.controls['description'].setValue(Response.data?.description);
        this.monitizationForm.controls['minAmount'].setValue(Response.data.minAmount);
        this.monitizationForm.controls['maxAmount'].setValue(Response.data.maxAmount);
        this.monitizationForm.controls['percentage'].setValue(Response.data.percentage);
        this.monitizationForm.controls['amount'].setValue(Response.data.amount);
        this.monitizationForm.controls['paymentMode'].setValue(Response.data.paymentMode);
        this.monitizationForm.controls['paymentType'].setValue(Response.data.paymentType);
      }
    })
  }

  save() {
    if (this.monitizationForm.invalid) {
      this.submittedData = true;
      return;
    }

    let obj = {
      description: this.monitizationForm.value.description,
      minAmount: this.monitizationForm.value.minAmount,
      maxAmount: this.monitizationForm.value.maxAmount,
      percentage: this.monitizationForm.value.percentage,
      amount: this.monitizationForm.value.amount,
      paymentMode: this.monitizationForm.value.paymentMode,
      paymentType: this.monitizationForm.value.paymentType,
    }
    this.monitizationService.addNewData(obj).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.defaultForm();
        this.submittedData = false;
        this.router.navigateByUrl('/admin/monitization-list');
        this.commonService.notifier('success', 'Data Saved Successfully.', 2000, false);
      }
      else {
        this.commonService.notifier('error', Response.meta.message, 2000, false)
      }
    })
  }

  update() {
    if (this.monitizationForm.invalid) {
      this.submittedData = true;
      return;
    }

    let obj = {
      description: this.monitizationForm.value.description,
      minAmount: this.monitizationForm.value.minAmount,
      maxAmount: this.monitizationForm.value.maxAmount,
      percentage: this.monitizationForm.value.percentage,
      amount: this.monitizationForm.value.amount,
      paymentMode: this.monitizationForm.value.paymentMode,
      paymentType: this.monitizationForm.value.paymentType,
    }
    this.monitizationService.updateData({ id: this.mID }, obj).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.defaultForm();
        this.submittedData = false;
        this.router.navigateByUrl('/admin/monitization-list');
        this.commonService.notifier('success', 'Data Updated.', 2000, false);
      }
      else {
        this.commonService.notifier('error', Response.meta.message, 2000, false)
      }
    })
  }


}
