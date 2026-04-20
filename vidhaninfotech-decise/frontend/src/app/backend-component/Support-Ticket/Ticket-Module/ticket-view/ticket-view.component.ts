import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SupportTicketService } from '../../support-ticket.service';
import { CommonService, StorageKey, quenotifier } from 'src/app/shared/common.service';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { TicketViewService } from './ticket-view.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-ticket-view',
  templateUrl: './ticket-view.component.html',
  styleUrls: ['./ticket-view.component.scss']
})
export class TicketViewComponent implements OnInit {

  tID: any;
  supportTicketData: any;

  constructor(public router: Router, public ticketView: TicketViewService, public http: HttpClient, public route: ActivatedRoute, public commonService: CommonService, public supportTicketService: SupportTicketService) {

    route.params.subscribe((x: any) => {
      this.tID = x.id;
    })


  }

  ngOnInit(): void {

    this.supportTicketService.supportTicketListData.subscribe((data) => {
      if (data) {
        this.supportTicketData = data;
      }
    })

    this.supportTicketService.getSupportTicketAllList({ ticketID: this.tID });

  }

  async closeTicket(id: any) {
    let checkReturnType: boolean = await quenotifier('Are you sure ?', 'warning', "You won't be able to close this!", "Yes, Close it!");

    if (checkReturnType == true) {
      this.supportTicketService.closeTicket({ id: id }).subscribe((Response: any) => {
        if (Response.meta.code == 200) {
          this.commonService.notifier('success', 'Removed Successfully.', 2000, false);
          this.supportTicketService.getSupportTicketAllList({ ticketID: this.tID });
        }
      })
    }
  }

  replyData: any = '';
  submittedReplyData: any = '';
  attachmentList: any[] = [];
  @ViewChild('attachment') attachmentListVariable: ElementRef;

  preview(files: any) {
    let fileData = Array.from(files);
    if (files.length === 0)
      return;

    fileData.map((x: any) => {
      // this.ticketView.compress(x)
      //   .subscribe(compressedImage => {
      //     console.log(`Image size after compressed: ${compressedImage.size} bytes.`)
      // })
      this.attachmentList.push(x);
    })
    this.attachmentListVariable.nativeElement.value = "";
  }
  removeuploadFile(index: any) {
    this.attachmentList.splice(index, 1)
    this.attachmentListVariable.nativeElement.value = "";
  }

  async reply() {
    if (!this.replyData) {
      this.submittedReplyData = true;
      return
    }

    let query = {
      isMobile: 1
    }
    let fileList: any = [];

    if (this.attachmentList.length > 0) {
      fileList = await this.getUploadedFileURL(this.attachmentList);
    };

    console.log(fileList);


    let replyDataObj: FormData = new FormData();
    replyDataObj.append("userID", this.commonService.getValue(StorageKey.loginData).id);
    replyDataObj.append("ticketID", this.tID);
    replyDataObj.append("description", this.replyData);
    replyDataObj.append("supportTicketFile", fileList.length > 0 ? fileList.toString() : null)


    this.supportTicketService.replyComment(query, replyDataObj).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.submittedReplyData = false;
        this.replyData = '';
        this.attachmentList = [];
        this.supportTicketService.getSupportTicketAllList({ ticketID: this.tID });
      }
      else {
        this.commonService.notifier('error', Response.meta.message, 2000, false);
      }
    })
  }

  async getUploadedFileURL(fileArray: any) {
    let fileList: any = [];
    let fileDataList: any = [];

    // Using a for...of loop to properly handle asynchronous operations
    for (const file of fileArray) {
      const reader = new FileReader();
      reader.readAsBinaryString(file);

      // Creating a promise to handle the file reading operation
      const fileReadPromise = new Promise<void>((resolve, reject) => {
        reader.onload = () => {
          const imageData = btoa(reader.result as string);
          const binaryData = reader.result;
          fileDataList.push(file);
          resolve();
        };
        reader.onerror = () => {
          console.error('Error occurred while reading the file');
          reject('Error occurred while reading the file');
        };
      });

      try {
        await fileReadPromise; // Wait for the file reading to complete
      } catch (error) {
        console.error('Error reading file:', error);
        throw error;
      }
    }

    // Using a for...of loop to properly handle asynchronous upload operations
    for (const fileData of fileDataList) {
      try {
        const fileName = "supportTicketFile-" + Date.now() + '-' + Math.round(Math.random() * 1E9) + "." + fileData.name.split(".")[1];
        let obj = {
          fileName: fileName,
          fileType: fileData.type
        }
        let url: any = await this.supportTicketService.getURL(obj).toPromise()
        if (url.meta.code == 200) {
          const response: any = await this.supportTicketService.uploadfileAWSS3(url.data, fileData.type, fileData).toPromise()

          fileList.push("https://desice-uploaded-files.s3.eu-north-1.amazonaws.com/" + fileName)

        }

      } catch (error) {
        console.error('Error making PUT request:', error);
        throw error;
      }
    }

    return fileList;
  }
}
