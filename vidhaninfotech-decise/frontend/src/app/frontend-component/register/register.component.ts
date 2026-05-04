import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from 'src/app/shared/common.service';
import { Router } from 'express';
import { ActivatedRoute } from '@angular/router';
import { FrontLayoutService } from 'src/app/Layout/front-layout/front-layout.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  newZealandBankAccount: boolean = false;
  submittedData: boolean = false;
  registerForm: FormGroup;
  appStoreUrl: string = environment.appStoreUrl;
  playStoreUrl: string = environment.playStoreUrl;
  get fRegisterData() { return this.registerForm.controls }
  constructor(
    public fb: FormBuilder,
    public frontse: FrontLayoutService,
    public commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.defaultForm()
  }
  defaultForm() {
    this.registerForm = this.fb.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/)]],
      phone: ['', [Validators.required]],
      description: [''],
      // isNewZealandBankAccount: [false, [Validators.required]],
    })
  }
  save() {
    if (this.registerForm.invalid) {
      this.submittedData = true;
      return;
    }

    let obj = {
      firstName: this.registerForm.value.firstname,
      lastName: this.registerForm.value.lastname,
      email: this.registerForm.value.email,
      phone: this.registerForm.value.phone.toString(),
      description: this.registerForm.value.description,
      isNewZealandBankAccount: this.registerForm.value.isNewZealandBankAccount,
    }

    this.frontse.addNewData(obj).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.defaultForm();
        this.submittedData = false;
        // this.router.navigateByUrl('/admin/monitization-list');
        this.commonService.notifier('success', 'Data Saved Successfully.', 2000, false);
      }
      else {
        this.commonService.notifier('error', Response.meta.message, 2000, false)
      }
    })
  }
}
