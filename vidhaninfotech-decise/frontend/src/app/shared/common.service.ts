import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { environment } from './../../environments/environment';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  rootData: any = {};
  constructor(private http: HttpClient) {
    this.rootData.rootUrl = environment.apiUrl;
    this.rootData.uploadsUrl = environment.uploadsUrl;
  }

  getTokenHeader() {
    let localstorageData: any = sessionStorage.getItem("loginData");
    let LoginUserData = JSON.parse(localstorageData);
    let AuthorizationTokenHeader = new HttpHeaders({
      'Authorization': `Bearer ${LoginUserData.myToken}`
    });
    return AuthorizationTokenHeader;
  }

  getReturnTypeContentJSON() {
    let contentTypeJSON = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return contentTypeJSON;
  }

  getTokenWithContentTypeJSON() {
    let localstorageData: any = sessionStorage.getItem("loginData");
    let LoginUserData = JSON.parse(localstorageData);
    let authorizationContentJSONReturn = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LoginUserData.myToken}`
    });
    return authorizationContentJSONReturn;
  }

  // for get method url
  get(path: any, params: any, header: any) {
    return this.http.get(environment.apiUrl + path, { params: params, headers: header })
  }
  // for post method url
  post(path: any, params: any, body: any, header: any) {
    return this.http.post(environment.apiUrl + path, body, { params: params, headers: header })
  }
  // for put method url
  put(path: any, params: any, body: any, header: any) {
    return this.http.put(environment.apiUrl + path, body, { params: params, headers: header })
  }

  uploadput(path: any, body: any, header: any) {
    return this.http.put(environment.uploadFile + path, body, { headers: header })
  }
  // for delete method url
  delete(path: any, params: any, header: any) {
    return this.http.delete(environment.apiUrl + path, { params: params, headers: header })
  }
  // for alert popup
  notifier(icon: any, text: any, timer: any, showButtonConfirm: boolean) {
    Swal.fire({
      text: text,
      icon: icon,
      timer: timer,
      showConfirmButton: showButtonConfirm
    });
  }
  // quenotifier(title: any, icon: any, text: any, confirmBtnText: any) {
  //   let data = Swal.fire({
  //     title: title,
  //     text: text,
  //     icon: icon,
  //     showCancelButton: true,
  //     confirmButtonColor: "#3f6ad8",
  //     cancelButtonColor: "#d33",
  //     confirmButtonText: confirmBtnText
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       return true
  //     }
  //     else {
  //       return false
  //     }
  //   });

  //   return data;
  // }
  // get value in localstorage
  getValue(key: any): any {
    let localData: any = sessionStorage.getItem(key);
    let data = JSON.parse(localData)
    return data;
  }
  // set value in localstorage
  setValue(key: any, value: any): void {
    sessionStorage.setItem(key, value);
  }
  // remove value in localstorage
  removeValue(key: any): void {
    sessionStorage.removeItem(key);
  }

  loadJavaScriptFile() {
    // Use dynamic script loading or any other method to load your JavaScript file
    const script = document.createElement('script');
    script.src = '../../assets/js/theme.js';
    document.body.appendChild(script);
  }
}

export class StorageKey {
  public static loginData = 'loginData';
}


export const quenotifier = async (title: any, icon: any, text: any, confirmBtnText: any): Promise<boolean> => {
  try {
    const result: any = await Swal.fire({
      title: title,
      text: text,
      icon: icon,
      showCancelButton: true,
      confirmButtonColor: "#3f6ad8",
      cancelButtonColor: "#d33",
      confirmButtonText: confirmBtnText
    });

    return result.isConfirmed;
  } catch (error) {
    console.log(error);
    return false;
  }
};
