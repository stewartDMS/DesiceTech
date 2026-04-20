import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/shared/common.service';
import { AccountService } from '../account.service';

@Component({
  selector: 'app-account-create',
  templateUrl: './account-create.component.html',
  styleUrls: ['./account-create.component.scss']
})
export class AccountCreateComponent implements OnInit {

  submittedData: boolean = false;
  isEdit: boolean = false;
  paymentType: any[] = [
    { name: 'Auto', value: 1 },
    { name: 'Manual', value: 2 }
  ]
  accountForm: FormGroup;
  get fAccountData() { return this.accountForm.controls; }
  mID: any

  constructor(public fb: FormBuilder, public accountService: AccountService, public router: Router, public commonService: CommonService, public route: ActivatedRoute) {
    if (router.url.includes('admin-account-list/update')) {
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
    this.accountForm = this.fb.group({
      id: [''],
      accountID: ['', [Validators.required]],
      accountHolderName: ['', [Validators.required]],
      bankName: ['', [Validators.required]],
      prefixCode: ['', [Validators.required]]
    })
  }

  edit() {
    this.accountService.getDataByID({ id: this.mID }).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.accountForm.controls['id'].setValue(Response.data.id);
        this.accountForm.controls['accountID'].setValue(Response.data.accountID);
        this.accountForm.controls['accountHolderName'].setValue(Response.data.accountHolderName);
        this.accountForm.controls['bankName'].setValue(Response.data.bankName);
        this.accountForm.controls['prefixCode'].setValue(Response.data.prefixCode);
      }
    })
  }

  save() {
    if (this.accountForm.invalid) {
      this.submittedData = true;
      return;
    }

    let obj = {
      accountID: this.accountForm.value.accountID,
      accountHolderName: this.accountForm.value.accountHolderName,
      bankName: this.accountForm.value.bankName,
      prefixCode: this.accountForm.value.prefixCode,
    }
    this.accountService.addNewData(obj).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.defaultForm();
        this.submittedData = false;
        this.router.navigateByUrl('/admin/admin-account-list');
        this.commonService.notifier('success', 'Data Saved Successfully.', 2000, false);
      }
      else {
        this.commonService.notifier('error', Response.meta.message, 2000, false)
      }
    })
  }

  update() {
    if (this.accountForm.invalid) {
      this.submittedData = true;
      return;
    }

    let obj = {
      accountID: this.accountForm.value.accountID,
      accountHolderName: this.accountForm.value.accountHolderName,
      bankName: this.accountForm.value.bankName,
      prefixCode: this.accountForm.value.prefixCode,
    }
    this.accountService.updateData({ id: this.mID }, obj).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.defaultForm();
        this.submittedData = false;
        this.router.navigateByUrl('/admin/admin-account-list');
        this.commonService.notifier('success', 'Data Updated.', 2000, false);
      }
      else {
        this.commonService.notifier('error', Response.meta.message, 2000, false)
      }
    })
  }


}
