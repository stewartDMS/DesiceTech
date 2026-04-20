import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { ConfirmedValidator } from './confirm-validator';
import { LoginLayoutService } from 'src/app/Layout/login-layout/login-layout.service';
import { Router } from '@angular/router';
import { CommonService, StorageKey } from 'src/app/shared/common.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  otp: any = '';

  isLoginFlag: boolean = false;
  isSendOTPFlag: boolean = false;
  isOTPVerifyFlag: boolean = false;
  isNewPassword: boolean = false;

  loginForm: FormGroup;
  otpForm: FormGroup;
  otpVerifyForm: FormGroup;
  newPasswordForm: FormGroup;

  get fLoginData() { return this.loginForm.controls; }
  get fotpData() { return this.otpForm.controls; }
  get fotpVerifyData() { return this.otpVerifyForm.controls; }
  get fnewPasswordData() { return this.newPasswordForm.controls; }

  submittedLoginData = false;
  submittedOtpData = false;
  submittedOtpVerifyData = false;
  submittedNewPasswordData = false;

  otpMessage: string | any;

  config = {
    allowNumbersOnly: true,
    length: 4,
    isPasswordInput: true,
    disableAutoFocus: false,
    placeholder: '',
  };



  constructor(public fb: FormBuilder, public commonService: CommonService, public loginlayoutService: LoginLayoutService, public router: Router) {
    this.loginlayoutService.authCheckIsLogin();

  }

  ngOnInit(): void {
    this.defaultloginForm();
    this.loginPage();
  }

  loginPage() {
    this.defaultloginForm();
    this.isLoginFlag = true;
    this.isSendOTPFlag = false;
    this.isOTPVerifyFlag = false;
    this.isNewPassword = false;
  }
  otpSend() {
    this.defaultOTPForm();
    this.isLoginFlag = false;
    this.isSendOTPFlag = true;
    this.isOTPVerifyFlag = false;
    this.isNewPassword = false;
  }
  otpVerificationPage() {
    this.defaultOTPVerifyForm();
    this.isLoginFlag = false;
    this.isSendOTPFlag = false;
    this.isOTPVerifyFlag = true;
    this.isNewPassword = false;
  }
  forgotPasswordPage() {
    this.defaultNewPINForm();
    this.isLoginFlag = false;
    this.isSendOTPFlag = false;
    this.isOTPVerifyFlag = false;
    this.isNewPassword = true;
  }

  defaultloginForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(/^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/)]],
      password: ['', [Validators.required]]
    });
  }
  defaultOTPForm() {
    this.otpForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(/^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/)]],
    });
  }
  defaultOTPVerifyForm() {
    this.otpVerifyForm = this.fb.group({
      id: [''],
    });
  }
  defaultNewPINForm() {
    this.newPasswordForm = this.fb.group({
      id: [''],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    }, {
      validator: ConfirmedValidator('password', 'confirmPassword')
    });
  }

  onOTPChange(otps: any) {
    this.otp = otps;
    if (this.otp.length == 4) {
      this.otpMessage = ""
    }
  }


  login() {
    if (this.loginForm.invalid) {
      this.submittedLoginData = true;
      return;
    }

    let obj = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    }

    this.loginlayoutService.login(obj).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.loginlayoutService.alertNotify('success', Response.meta.message, 2000, false);
        this.defaultloginForm();
        this.submittedLoginData = false;
        Response.data.isLogin = true;
        this.commonService.setValue(StorageKey.loginData, JSON.stringify(Response.data));
        this.router.navigateByUrl('/admin');
      }
      else {
        this.loginlayoutService.alertNotify('error', Response.meta.message, 2000, false);
      }
    })
  }


  SendOTP() {
    if (this.otpForm.invalid) {
      this.submittedOtpData = true;
      return
    }

    let obj = {
      email: this.otpForm.value.email
    }

    this.loginlayoutService.sendOTPByEmail(obj).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.otpVerificationPage();
        this.otpVerifyForm.controls['id'].setValue(Response.data);
        this.loginlayoutService.alertNotify('success', 'Please Check You Email.', 2000, false)
      }
      else {
        this.loginlayoutService.alertNotify('error', Response.meta.message, 2000, false)
      }
    })
  }
  verifyOTP() {
    if (this.otp.length != 4) {
      this.submittedOtpVerifyData = true;
      this.otpMessage = "Please Enter Valid OTP"
      return;
    }

    let obj = {
      id: this.otpVerifyForm.value.id,
      otp: this.otp
    }

    this.loginlayoutService.verifyOTP(obj).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.forgotPasswordPage();
        this.newPasswordForm.controls['id'].setValue(Response.data);
        this.loginlayoutService.alertNotify('success', 'Verify OTP, Please Set New Password.', 2000, false)
      }
      else {
        this.loginlayoutService.alertNotify('error', Response.meta.message, 2000, false)
      }
    })
  }
  updatePassword() {

    if (this.newPasswordForm.invalid) {
      this.submittedNewPasswordData = true;
      return
    }

    let obj = {
      id: this.newPasswordForm.value.id,
      password: this.newPasswordForm.value.password
    }

    this.loginlayoutService.updatePassword(obj).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.loginPage();
        this.loginlayoutService.alertNotify('success', 'Your password has been updated.', 2000, false)
      }
      else {
        this.loginlayoutService.alertNotify('error', Response.meta.message, 2000, false)
      }
    })

  }
}
