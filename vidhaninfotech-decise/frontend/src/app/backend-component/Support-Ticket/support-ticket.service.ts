import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from 'src/app/shared/common.service';

@Injectable({
  providedIn: 'root'
})
export class SupportTicketService {

  constructor(public commonService: CommonService, public http: HttpClient) { }

  supportTicketCategoryList: any[] = [];
  private supportTicketCategoryListDataSource = new BehaviorSubject<any>(this.supportTicketCategoryList);
  supportTicketCategoryListData = this.supportTicketCategoryListDataSource.asObservable();

  getSupportTicketCategoryAllList() {
    this.commonService.get('support-ticket/category/all-list', '', this.commonService.getTokenHeader()).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.supportTicketCategoryList = [];
        this.supportTicketCategoryList = Response.data;
        this.supportTicketCategoryListDataSource.next(this.supportTicketCategoryList)
      }
      else {
        this.supportTicketCategoryList = [];
        this.supportTicketCategoryListDataSource.next(this.supportTicketCategoryList)
      }
    })
  }

  addSupportTicketCategoryNewData(body: any) {
    return this.commonService.post('support-ticket/category/create', '', body, this.commonService.getTokenHeader())
  }

  updateSupportTicketCategoryData(params: any, body: any) {
    return this.commonService.put('support-ticket/category/update', params, body, this.commonService.getTokenHeader())
  }

  getSupportTicketCategoryDataByID(params: any) {
    return this.commonService.get('support-ticket/category/supportTicket-Category-ByID', params, this.commonService.getTokenWithContentTypeJSON())
  }

  deleteSupportTicketCategoryData(params: any) {
    return this.commonService.delete('support-ticket/category/delete', params, this.commonService.getTokenWithContentTypeJSON())
  }




  supportTicketList: any[] = [];
  private supportTicketListDataSource = new BehaviorSubject<any>(this.supportTicketList);
  supportTicketListData = this.supportTicketListDataSource.asObservable();

  getSupportTicketAllList(params: any) {
    this.commonService.get('support-ticket/get-ticket-data-fAdmin', params, this.commonService.getTokenHeader()).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.supportTicketList = [];
        this.supportTicketList = Response.data;
        this.supportTicketListDataSource.next(this.supportTicketList)
      }
      else {
        this.supportTicketList = [];
        this.supportTicketListDataSource.next(this.supportTicketList)
      }
    })
  }

  closeTicket(params: any) {
    return this.commonService.get('support-ticket/close-ticket', params, this.commonService.getTokenWithContentTypeJSON())
  }

  replyComment(params: any, body: any) {
    return this.commonService.post('support-ticket/reply-ticket', params, body, this.commonService.getTokenHeader())
  }

  // uploadFile(params: any, body: any) {
  //   let AuthorizationTokenHeader = new HttpHeaders({
  //     "Content-Type": "text/plain",
  //     'Access-Control-Allow-Origin': '*',
  //     'Access-Control-Allow-Methods': 'PUT',
  //     "Accept": "*"
  //   });
  //   return this.commonService.uploadput(params, body, AuthorizationTokenHeader)
  // }

  getURL(params: any) {
    return this.commonService.get('support-ticket/uploadTicketFile', params, this.commonService.getTokenHeader())
  }

  uploadfileAWSS3(fileuploadurl: any, contenttype: any, file: any) {

    const headers = new HttpHeaders({ 'Content-Type': contenttype });
    const req = new HttpRequest(
      'PUT',
      fileuploadurl,
      file,
      {
        headers: headers,
      });
    return this.http.request(req);
  }

}
