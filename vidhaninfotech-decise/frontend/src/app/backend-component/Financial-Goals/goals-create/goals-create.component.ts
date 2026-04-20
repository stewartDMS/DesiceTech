import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/shared/common.service';
import { FinancialGoalsService } from '../financial-goals.service';

@Component({
  selector: 'app-goals-create',
  templateUrl: './goals-create.component.html',
  styleUrls: ['./goals-create.component.scss']
})
export class GoalsCreateComponent implements OnInit {

  submittedData: boolean = false;
  isEdit: boolean = false;
  groupList: any[] = [
    { name: 'Debt', value: 1 },
    { name: 'Saving', value: 2 },
    { name: 'Invest', value: 3 },
    { name: 'Billings', value: 4 },
  ]
  financialGoalForm: FormGroup;
  get fFinancialGoalData() { return this.financialGoalForm.controls; }
  FGID: any

  constructor(public fb: FormBuilder, public financialGoalsService: FinancialGoalsService, public router: Router, public commonService: CommonService, public route: ActivatedRoute) {
    if (router.url.includes('financial-goal/update')) {
      route.params.subscribe((x: any) => {
        this.FGID = x.id;
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
    this.financialGoalForm = this.fb.group({
      id: [''],
      group: [null, [Validators.required]],
      name: ['', [Validators.required]],
    })
  }

  edit() {
    this.financialGoalsService.getDataByID({ id: this.FGID }).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.financialGoalForm.controls['id'].setValue(Response.data.id);
        this.financialGoalForm.controls['group'].setValue(Response.data.group);
        this.financialGoalForm.controls['name'].setValue(Response.data.name);
      }
    })
  }

  save() {
    if (this.financialGoalForm.invalid) {
      this.submittedData = true;
      return;
    }

    let obj = {
      group: this.financialGoalForm.value.group,
      name: this.financialGoalForm.value.name,
    }
    this.financialGoalsService.addNewData(obj).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.defaultForm();
        this.submittedData = false;
        this.router.navigateByUrl('/admin/financial-goal');
        this.commonService.notifier('success', 'Data Saved Successfully.', 2000, false);
      }
      else {
        this.commonService.notifier('error', Response.meta.message, 2000, false)
      }
    })
  }

  update() {
    if (this.financialGoalForm.invalid) {
      this.submittedData = true;
      return;
    }

    let obj = {
      group: this.financialGoalForm.value.group,
      name: this.financialGoalForm.value.name,
    }
    this.financialGoalsService.updateData({ id: this.FGID }, obj).subscribe((Response: any) => {
      if (Response.meta.code == 200) {
        this.defaultForm();
        this.submittedData = false;
        this.router.navigateByUrl('/admin/financial-goal');
        this.commonService.notifier('success', 'Data Updated.', 2000, false);
      }
      else {
        this.commonService.notifier('error', Response.meta.message, 2000, false)
      }
    })
  }


}
