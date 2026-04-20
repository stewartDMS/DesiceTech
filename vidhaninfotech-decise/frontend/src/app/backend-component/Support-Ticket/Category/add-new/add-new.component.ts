import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/shared/common.service';
import { SupportTicketService } from '../../support-ticket.service';

@Component({
  selector: 'app-add-new',
  templateUrl: './add-new.component.html',
  styleUrls: ['./add-new.component.scss']
})
export class AddNewComponent implements OnInit {

  submittedData: boolean = false;
  isEdit: boolean = false;
  paymentType: any[] = [
    { name: 'Auto', value: 1 },
    { name: 'Manual', value: 2 }
  ]
  supportTicketCategoryForm: FormGroup;
  get fSupportTicketCategoryData() { return this.supportTicketCategoryForm.controls; }
  mID: any

  constructor(public fb: FormBuilder, public supportTicket: SupportTicketService, public router: Router, public commonService: CommonService, public route: ActivatedRoute) {
    if (router.url.includes('support-ticket/category/update')) {
      route.params.subscribe((x: any) => {
        this.mID = x.id;
        this.isEdit = true;
      })
    }
    else {
      this.isEdit = false;
    }
  }

  ngOnInit(): void {
    this.defaultForm();
    if (this.isEdit == true) {
      this.edit();
    }
  }

  defaultForm() {
    this.supportTicketCategoryForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required]],
    })
  }

  edit() {
    this.supportTicket.getSupportTicketCategoryDataByID({ id: this.mID }).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.supportTicketCategoryForm.controls['id'].setValue(Response.data.id);
        this.supportTicketCategoryForm.controls['name'].setValue(Response.data.name);
      }
    })
  }

  save() {
    if (this.supportTicketCategoryForm.invalid) {
      this.submittedData = true;
      return;
    }

    let obj = {
      name: this.supportTicketCategoryForm.value.name,
    }
    this.supportTicket.addSupportTicketCategoryNewData(obj).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.defaultForm();
        this.submittedData = false;
        this.router.navigateByUrl('/admin/support-ticket/category');
        this.commonService.notifier('success', 'Data Saved Successfully.', 2000, false);
      }
      else {
        this.commonService.notifier('error', Response.meta.message, 2000, false)
      }
    })
  }

  update() {
    if (this.supportTicketCategoryForm.invalid) {
      this.submittedData = true;
      return;
    }

    let obj = {
      name: this.supportTicketCategoryForm.value.name,
    }
    this.supportTicket.updateSupportTicketCategoryData({ id: this.mID }, obj).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.defaultForm();
        this.submittedData = false;
        this.router.navigateByUrl('/admin/support-ticket/category');
        this.commonService.notifier('success', 'Data Updated.', 2000, false);
      }
      else {
        this.commonService.notifier('error', Response.meta.message, 2000, false)
      }
    })
  }


}
