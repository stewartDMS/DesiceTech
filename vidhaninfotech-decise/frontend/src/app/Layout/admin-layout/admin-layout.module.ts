import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminLayoutRoutingModule } from './admin-layout-routing.module';
import { DirectivesModule } from 'src/app/shared/directives/directives.module';
import { PipeModule } from 'src/app/shared/pipe/pipe.module';
import { DashboardComponent } from 'src/app/backend-component/dashboard/dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MonitizationListComponent } from 'src/app/backend-component/Migration-Component/monitization-list/monitization-list.component';
import { MonitizationCreateComponent } from 'src/app/backend-component/Migration-Component/monitization-create/monitization-create.component';
import { ComponentModule } from 'src/app/component/component.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { AccountCreateComponent } from 'src/app/backend-component/Admin-Account/account-create/account-create.component';
import { AccountListComponent } from 'src/app/backend-component/Admin-Account/account-list/account-list.component';
import { SupportTicketComponent } from 'src/app/backend-component/Support-Ticket/support-ticket.component';
import { UserListComponent } from 'src/app/backend-component/Setting/admin-user/user-list/user-list.component';
import { UserAddComponent } from 'src/app/backend-component/Setting/admin-user/user-add/user-add.component';
import { AkahuUserListComponent } from 'src/app/backend-component/Setting/akahu-user/akahu-user-list/akahu-user-list.component';
import { ListComponent } from 'src/app/backend-component/Setting/split-payment/Category/list/list.component';
import { CreateComponent } from 'src/app/backend-component/Setting/split-payment/Category/create/create.component';
import { SplitPaymentListComponent } from 'src/app/backend-component/split-payment/split-payment-list/split-payment-list.component';
import { SplitPaymentViewComponent } from 'src/app/backend-component/split-payment/split-payment-view/split-payment-view.component';
import { TransactionAdminListComponent } from 'src/app/backend-component/split-payment/transaction-admin-list/transaction-admin-list.component';
import { TransactionUserListComponent } from 'src/app/backend-component/split-payment/transaction-user-list/transaction-user-list.component';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { A11yModule } from '@angular/cdk/a11y';
import { NgApexchartsModule } from 'ng-apexcharts';
import { GoalsCreateComponent } from 'src/app/backend-component/Financial-Goals/goals-create/goals-create.component';
import { GoalsListComponent } from 'src/app/backend-component/Financial-Goals/goals-list/goals-list.component';
import { RegisteredUserComponent } from 'src/app/backend-component/registered-user/registered-user.component';
import { SubscribedListComponent } from 'src/app/backend-component/subscribed-list/subscribed-list.component';

@NgModule({
  declarations: [
    DashboardComponent,
    MonitizationListComponent,
    MonitizationCreateComponent,
    AccountCreateComponent,
    AccountListComponent,
    SupportTicketComponent,
    UserListComponent,
    UserAddComponent,
    AkahuUserListComponent,
    ListComponent,
    CreateComponent,
    SplitPaymentListComponent,
    SplitPaymentViewComponent,
    TransactionAdminListComponent,
    TransactionUserListComponent,
    GoalsCreateComponent,
    GoalsListComponent,
    RegisteredUserComponent,
    SubscribedListComponent
  ],
  imports: [
    CommonModule,
    ComponentModule,
    AdminLayoutRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    DirectivesModule,
    PipeModule,
    MatButtonModule,
    NgxPaginationModule,
    MatSidenavModule,
    MatIconModule,
    MatTableModule,
    CdkTableModule,
    CdkTreeModule,
    A11yModule,
    NgApexchartsModule,
  ],
  exports: [
    MatButtonModule,
    MatSidenavModule
  ]
})
export class AdminLayoutModule { }
