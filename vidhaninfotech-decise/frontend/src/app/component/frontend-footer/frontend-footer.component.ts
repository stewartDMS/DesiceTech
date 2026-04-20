import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FrontLayoutService } from 'src/app/Layout/front-layout/front-layout.service';
import { CommonService } from 'src/app/shared/common.service';

@Component({
  selector: 'app-frontend-footer',
  templateUrl: './frontend-footer.component.html',
  styleUrls: ['./frontend-footer.component.scss']
})
export class FrontendFooterComponent implements OnInit {
  submittedData: boolean = false;
  registerForm: FormGroup;
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
      email: ['', [Validators.required, Validators.pattern(/^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/)]],
    })
  }
  save() {
    if (this.registerForm.invalid) {
      this.submittedData = true;
      return;
    }

    let obj = {
      email: this.registerForm.value.email,
    }

    this.frontse.addNewsLetterSubscription(obj).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.defaultForm();
        this.submittedData = false;
        this.commonService.notifier('success', 'You Have Successfully Subscribed For Newsletter.', 2000, false);
      }
      else {
        this.commonService.notifier('error', Response.meta.message, 2000, false)
      }
    })
  }
}
