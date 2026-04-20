import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountCreateComponent } from 'src/app/backend-component/Admin-Account/account-create/account-create.component';
import { AccountListComponent } from 'src/app/backend-component/Admin-Account/account-list/account-list.component';
import { GoalsCreateComponent } from 'src/app/backend-component/Financial-Goals/goals-create/goals-create.component';
import { GoalsListComponent } from 'src/app/backend-component/Financial-Goals/goals-list/goals-list.component';
import { MonitizationCreateComponent } from 'src/app/backend-component/Migration-Component/monitization-create/monitization-create.component';
import { MonitizationListComponent } from 'src/app/backend-component/Migration-Component/monitization-list/monitization-list.component';
import { UserAddComponent } from 'src/app/backend-component/Setting/admin-user/user-add/user-add.component';
import { UserListComponent } from 'src/app/backend-component/Setting/admin-user/user-list/user-list.component';
import { AkahuUserListComponent } from 'src/app/backend-component/Setting/akahu-user/akahu-user-list/akahu-user-list.component';
import { CreateComponent } from 'src/app/backend-component/Setting/split-payment/Category/create/create.component';
import { ListComponent } from 'src/app/backend-component/Setting/split-payment/Category/list/list.component';
import { SupportTicketComponent } from 'src/app/backend-component/Support-Ticket/support-ticket.component';
import { DashboardComponent } from 'src/app/backend-component/dashboard/dashboard.component';
import { SplitPaymentListComponent } from 'src/app/backend-component/split-payment/split-payment-list/split-payment-list.component';
import { SplitPaymentViewComponent } from 'src/app/backend-component/split-payment/split-payment-view/split-payment-view.component';
import { TransactionAdminListComponent } from 'src/app/backend-component/split-payment/transaction-admin-list/transaction-admin-list.component';
import { TransactionUserListComponent } from 'src/app/backend-component/split-payment/transaction-user-list/transaction-user-list.component';
import { RegisteredUserComponent } from 'src/app/backend-component/registered-user/registered-user.component';
import { SubscribedListComponent } from 'src/app/backend-component/subscribed-list/subscribed-list.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },

  // monitization URL
  { path: 'registered-user', component: RegisteredUserComponent },
  { path: 'subscribed-list', component: SubscribedListComponent },

  { path: 'monitization-list', component: MonitizationListComponent },
  { path: 'monitization-list/add', component: MonitizationCreateComponent },
  { path: 'monitization-list/update/:id', component: MonitizationCreateComponent },

  { path: 'split-payments', component: SplitPaymentListComponent },
  { path: 'split-payments/:id', component: SplitPaymentViewComponent },

  { path: 'financial-goal', component: GoalsListComponent },
  { path: 'financial-goal/add', component: GoalsCreateComponent },
  { path: 'financial-goal/update/:id', component: GoalsCreateComponent },

  { path: 'transactions/platform-fees', component: TransactionAdminListComponent },
  { path: 'transactions/list', component: TransactionUserListComponent },

  // admin-account URL
  { path: 'admin-account-list', component: AccountListComponent },
  { path: 'admin-account-list/add', component: AccountCreateComponent },
  { path: 'admin-account-list/update/:id', component: AccountCreateComponent },

  // admin-users URL
  { path: 'setting/admin-users', component: UserListComponent },
  { path: 'setting/admin-users/add', component: UserAddComponent },
  { path: 'setting/admin-users/update/:id', component: UserAddComponent },

  // akahu-users URL
  { path: 'setting/akahu-users', component: AkahuUserListComponent },

  // split payment category
  { path: 'payment/category/list', component: ListComponent },
  { path: 'payment/category/create', component: CreateComponent },
  { path: 'payment/category/update/:id', component: CreateComponent },
  {
    path: 'support-ticket',
    component: SupportTicketComponent,
    children: [{
      path: '',
      loadChildren: () => import('../../backend-component/Support-Ticket/support-ticket.module').then(m => m.SupportTicketModule)
    }]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminLayoutRoutingModule { }
