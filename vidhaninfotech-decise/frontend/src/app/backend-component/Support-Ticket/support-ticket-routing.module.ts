import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TicketListComponent } from './Ticket-Module/ticket-list/ticket-list.component';
import { ListComponent } from './Category/list/list.component';
import { AddNewComponent } from './Category/add-new/add-new.component';
import { TicketViewComponent } from './Ticket-Module/ticket-view/ticket-view.component';

const routes: Routes = [
  { path: '', component: TicketListComponent },
  { path: 'view/:id', component: TicketViewComponent },

  { path: 'category', component: ListComponent },
  { path: 'category/add', component: AddNewComponent },
  { path: 'category/update/:id', component: AddNewComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SupportTicketRoutingModule { }
