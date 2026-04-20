import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/shared/common.service';
import { AdminUserService } from '../admin-user.service';

@Component({
  selector: 'app-user-add',
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.scss']
})
export class UserAddComponent implements OnInit {

  submittedData: boolean = false;
  isEdit: boolean = false;
  roleList: any[] = [
    { name: 'Admin', value: 2 },
    { name: 'Other', value: 3 }
  ]
  adminUserForm: FormGroup;
  get fAdminUserData() { return this.adminUserForm.controls; }
  aUID: any

  constructor(public fb: FormBuilder, public monitizationService: AdminUserService, public router: Router, public commonService: CommonService, public route: ActivatedRoute) {
    if (router.url.includes('admin/setting/admin-users/update')) {
      route.params.subscribe((x: any) => {
        this.aUID = x.id;
        this.defaultForm();
        this.isEdit = true;
      })
    }
    else {
      this.defaultForm();
      this.isEdit = false;
    }
  }

  ngOnInit(): void {
    if (this.isEdit == true) {
      this.edit();
    }
  }

  defaultForm() {
    this.adminUserForm = this.fb.group({
      id: [''],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
      role: [2]
    })
  }

  edit() {
    this.monitizationService.getDataByID({ id: this.aUID }).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.adminUserForm.controls['id'].setValue(Response.data.id);
        this.adminUserForm.controls['firstName'].setValue(Response.data.firstName);
        this.adminUserForm.controls['lastName'].setValue(Response.data.lastName);
        this.adminUserForm.controls['email'].setValue(Response.data.email);
        this.adminUserForm.controls['role'].setValue(Response.data.role);
      }
    })
  }

  save() {
    if (this.adminUserForm.invalid) {
      this.submittedData = true;
      return;
    }

    let obj = {
      firstName: this.adminUserForm.value.firstName,
      lastName: this.adminUserForm.value.lastName,
      email: this.adminUserForm.value.email,
      role: this.adminUserForm.value.role,
      password: this.adminUserForm.value.password,
    }
    this.monitizationService.addNewData(obj).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.defaultForm();
        this.submittedData = false;
        this.router.navigateByUrl('/admin/setting/admin-users');
        this.commonService.notifier('success', 'Data Saved Successfully.', 2000, false);
      }
      else {
        this.commonService.notifier('error', Response.meta.message, 2000, false)
      }
    })
  }

  update() {
    this.adminUserForm.get('password').clearValidators()
    this.adminUserForm.get('password').updateValueAndValidity();

    if (this.adminUserForm.invalid) {
      this.submittedData = true;
      return;
    }

    let obj = {
      firstName: this.adminUserForm.value.firstName,
      lastName: this.adminUserForm.value.lastName,
      email: this.adminUserForm.value.email,
      role: this.adminUserForm.value.role,
    }
    this.monitizationService.updateData({ id: this.aUID }, obj).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.defaultForm();
        this.submittedData = false;
        this.router.navigateByUrl('/admin/setting/admin-users');
        this.commonService.notifier('success', 'Data Updated.', 2000, false);
      }
      else {
        this.commonService.notifier('error', Response.meta.message, 2000, false)
      }
    })
  }


}
