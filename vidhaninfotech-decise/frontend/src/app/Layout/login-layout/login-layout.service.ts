import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService, StorageKey } from 'src/app/shared/common.service';

@Injectable({
  providedIn: 'root'
})
export class LoginLayoutService {

  constructor(public commonService: CommonService, public router: Router) { }

  alertNotify(icon: any, text: any, timer: any, showButtonConfirm: boolean) {
    return this.commonService.notifier(icon, text, timer, showButtonConfirm);
  }

  sendOTPByEmail(body: any) {
    return this.commonService.post('adminAuth/send-otp', '', body, '')
  }

  verifyOTP(body: any) {
    return this.commonService.post('adminAuth/verify-otp', '', body, '')
  }

  updatePassword(body: any) {
    return this.commonService.put('adminAuth/password-update', '', body, '')
  }

  login(body: any) {
    return this.commonService.post('adminAuth/login', '', body, '')
  }

  authCheckIsLogin() {
    let data = this.commonService.getValue(StorageKey.loginData);
    console.log(data);

    if (!data || data.isLogin != true) {
      this.router.navigateByUrl('/login')
    }
    else {
      this.router.navigateByUrl('/admin')
    }
  }

  changePassword(body: any) {
    return this.commonService.put('adminAuth/change-password', '', body, this.commonService.getTokenWithContentTypeJSON())
  }


}
