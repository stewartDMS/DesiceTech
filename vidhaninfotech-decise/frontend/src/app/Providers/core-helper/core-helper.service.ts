import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
//import { AdminLoginModel, UserDetail } from 'src/app/modules/back-office/admin-class';
import { ConstantKey } from './core-helper.classes';

@Injectable({
  providedIn: 'root'
})
export class CoreHelperService {

  frontOfficeLogin: boolean = true;
  private viewWarehouseDetails = new BehaviorSubject<Object>(false);
  warehouseDetailsData = this.viewWarehouseDetails.asObservable();

  constructor(private titleService: Title, private route: Router) { }


  setRootData = () => {
    this.viewWarehouseDetails.next(true);
  }
  setBrowserTabTitle = (title: string) => {
    this.titleService.setTitle(title);
  }

  isNullOrUndefined<T>(tObj: T): boolean {
    return tObj === null || tObj === undefined;
  }

  // isNullOrUndefinedMultiple(...tObj): boolean {
  //   return !tObj.every((tEntry) => tEntry !== null && tEntry !== undefined);
  // }

  isStringEmptyOrWhitespace(stringToParse: string) {
    return this.isNullOrUndefined(stringToParse) || stringToParse.trim() === '';
  }

  isArrayEmpty<T>(tArr: T[]): boolean {
    return this.isNullOrUndefined(tArr) || tArr.length <= 0;
  }

  getShortedText = (text: string, limit: number) => {
    if (!this.isNullOrUndefined(limit)) {
      return text.length > limit ? text.substring(0, limit) + '...' : text;
    }
    return text.length > ConstantKey.STRINGLIMITSHORT ? text.substring(0, ConstantKey.STRINGLIMITSHORT) + '...' : text;
  }

  removeAllWhiteSpaces = (text: string) => {
    return text.replace(/\s/g, '');
  }

  snakeCaseToLowerCase = (text: string) => {
    return text.replace(/\_/g, '');
  }

  minSelectedCheckboxes(min = 1) {
    const validator: ValidatorFn = (formArray: AbstractControl) => {
      if (formArray instanceof FormArray) {
        const totalSelected = formArray.controls.length;
        return totalSelected >= min ? null : { notSelected: true };
      }

      throw new Error('formArray is not an instance of FormArray');
    };

    return validator;
  }
  maxSelectedCheckboxes(max: number) {
    const validator: ValidatorFn = (formArray: AbstractControl) => {
      if (formArray instanceof FormArray) {
        const totalSelected = formArray.controls.length;
        return totalSelected > max ? { maxInvalid: true } : null;
      }

      throw new Error('formArray is not an instance of FormArray');
    };

    return validator;
  }

  //getAdminLoggedinUserDetail = () => {
  //  var userData = localStorage.getItem('currentUser');
  //  if (userData !== null && userData !== undefined && userData !== "") {
  //    return JSON.parse(userData) as UserDetail;
  //  }
  //  else {
  //    if (this.frontOfficeLogin) {
  //      this.route.navigate(['/frontoffice/login']);
  //    } else {
  //      this.route.navigate(['/backoffice/login']);
  //    }
  //  }
  //}
  //getAdminLoggedinUserDetailWithoutRoute = () => {
  //  var userData = localStorage.getItem('currentUser');
  //  if (userData !== null && userData !== undefined && userData !== "") {
  //    return JSON.parse(userData) as UserDetail;
  //  }
  //  else {
  //    if (this.frontOfficeLogin) {
  //      this.route.navigate(['/frontoffice/login']);
  //    } else {
  //      this.route.navigate(['/backoffice/login']);
  //    }
  //  }
  //}
  //setLoggedinUserDetail = (userData: UserDetail) => {
  //  localStorage.setItem('currentUser', JSON.stringify(userData));
  //  localStorage.setItem('token', JSON.stringify(userData.accessToken));

  //}

  //clearLocalStorage() {
  //  localStorage.clear();
  //}

  //getLoggedinAdmin = () => {
  //  var userData = localStorage.getItem('adminEmail');
  //  var userDetail = localStorage.getItem('userDetail')
  //  if (userData !== null && userData !== undefined && userData !== "") {
  //    return JSON.parse(userDetail) as AdminLoginModel;
  //  }
  //  else {
  //    this.route.navigate(['/backoffice/login']);
  //  }
  //}
  patternPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): any => {
      if (control.value) {

        const regex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})')
        const valid = regex.test(control.value);
        if (!valid) {
          return { invalidPassword: true };
        }
        // return valid ?  null : { invalidPassword: true };
      }
      //const regex = new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$');
    };
  }
  MustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors.mustMatch) {
        // return if another validator has already found an error on the matchingControl
        return;
      }

      // set error on matchingControl if validation fails
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    }
  }
  MustNotMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      // if (matchingControl.errors && !matchingControl.errors.mustMatch) {
      //   // return if another validator has already found an error on the matchingControl
      //   return;
      // }

      // set error on matchingControl if validation fails
      if (control.value == matchingControl.value) {
        matchingControl.setErrors({ mustNotMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    }
  }

  convertToTitleCase(str: any) {
    str = str.toLowerCase();
    str = str.split(' ');
    for (var i = 0; i < str.length; i++) {
      str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    }
    // Step 4. Return the output
    return str.join(' ');
  }
  getUrlValidation(): ValidatorFn {
     return (control: AbstractControl): any => {
      if (control.value) {
        const regex = new RegExp('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')
        const valid = regex.test(control.value);
        if (!valid) {
          return { invalidUrl: true };
        }
      }
    };
    
  }
  // Validators.pattern('^[a-zA-Z \-\']+')
  getNameValidation() : ValidatorFn {
    return (control: AbstractControl): any => {
     if (control.value) {
       const regex = new RegExp('^[a-zA-Z \-\']+')
       const valid = regex.test(control.value);
       if (!valid) {
         return { "invalidName": true };
       }
     }
   };
   
 }
 removeSpecialCharacter(event)
  {   
     var keyEvent;  
    keyEvent = event.charCode;  //        
     return((keyEvent > 64 &&keyEvent < 91) || (keyEvent > 96 &&keyEvent < 123) || keyEvent == 8 || keyEvent == 32 || (keyEvent >= 48 && keyEvent <= 57)); 
  }
  
  doNotAllowNumber() {
    return '^[a-zA-Z \-\']+';
  }
  getPhoneValidation() {
    return "^[0-9]*$";
  }
  getPhoneValidations() {
  return  /^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})$/;
}
}