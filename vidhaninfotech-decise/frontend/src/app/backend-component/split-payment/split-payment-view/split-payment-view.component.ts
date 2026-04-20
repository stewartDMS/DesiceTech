import { Component, OnInit } from '@angular/core';
import { SplitPaymentService } from '../split-payment.service';
import { CommonService } from 'src/app/shared/common.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-split-payment-view',
  templateUrl: './split-payment-view.component.html',
  styleUrls: ['./split-payment-view.component.scss']
})
export class SplitPaymentViewComponent implements OnInit {

  supportTicketData: any;
  splitPaymentId: any
  totalSum: Number = 0;

  constructor(public splitPaymentService: SplitPaymentService, public commonService: CommonService, public router: Router, public route: ActivatedRoute) {
    route.params.subscribe((x: any) => {
      this.splitPaymentId = x.id
    })
  }

  ngOnInit(): void {
    this.splitPaymentService.splitPaymentData.subscribe((data) => {
      if (data) {
        this.supportTicketData = data;
        if (data.splitBetweenList.length > 0) {
          data.splitBetweenList.map((x: any) => {
            this.totalSum = x.amount + this.totalSum
          })
        }
      }
    })

    this.splitPaymentService.getSplitPaymentData({ id: this.splitPaymentId });

  }


}
