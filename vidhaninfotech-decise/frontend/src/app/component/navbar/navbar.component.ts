import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminLayoutService } from 'src/app/Layout/admin-layout/admin-layout.service';
import { LoginLayoutService } from 'src/app/Layout/login-layout/login-layout.service';
import { ConfirmedValidator } from 'src/app/login-component/login-page/confirm-validator';
import { CommonService, StorageKey } from 'src/app/shared/common.service';
declare var $: any;

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  localData: any = '';
  changePasswordForm: FormGroup;
  submittedData: Boolean = false;
  get fChangePasswordData() { return this.changePasswordForm.controls; }
  notificationList: any[] = [];
  unViewCount: number = 0;

  constructor(private commonService: CommonService, private router: Router, public adminLayoutService: AdminLayoutService, public loginLayoutService: LoginLayoutService, private fb: FormBuilder) {
    this.localData = this.commonService.getValue(StorageKey.loginData)
  }

  ngOnInit(): void {
    this.defaultForm();

    this.adminLayoutService.notificationListData.subscribe(data => {
      if (!!data) {
        this.notificationList = data;
        console.log("data", data);

        data.map((x: any) => {
          if (x.isView == false) {
            this.unViewCount++;
          }
        })
      }
    })

    this.adminLayoutService.getNotificationListData({ pageNumber: 1 });
  }

  defaultForm() {
    this.changePasswordForm = this.fb.group({
      id: [''],
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validator: ConfirmedValidator('newPassword', 'confirmPassword')
    })
  }

  logout() {
    this.commonService.removeValue(StorageKey.loginData);
    this.router.navigateByUrl('login')
  }

  openModal() {
    this.defaultForm();
  }

  changePassword() {
    if (this.changePasswordForm.invalid) {
      this.submittedData = true;
      return;
    }

    let obj = {
      id: this.commonService.getValue(StorageKey.loginData).id,
      newPassword: this.changePasswordForm.value.newPassword,
      oldPassword: this.changePasswordForm.value.oldPassword,
    }

    this.loginLayoutService.changePassword(obj).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        $("#bs-example-modal-md").modal('hide');
        this.defaultForm();
        this.submittedData = false;
        this.commonService.notifier("success", "Password Changed.", 2000, false);
      } else {
        this.commonService.notifier("error", Response.meta.message, 2000, true);
      }
    })

  }

  viewNotification() {
    this.adminLayoutService.viewAllNotification().subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.notificationList.map((x: any) => {
          x.isView = true;
          this.unViewCount = 0;
        });

      }
    })
  }

}
