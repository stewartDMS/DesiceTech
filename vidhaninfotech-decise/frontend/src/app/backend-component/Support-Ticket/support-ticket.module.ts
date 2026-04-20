import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SupportTicketRoutingModule } from './support-ticket-routing.module';
import { ListComponent } from './Category/list/list.component';
import { AddNewComponent } from './Category/add-new/add-new.component';
import { TicketListComponent } from './Ticket-Module/ticket-list/ticket-list.component';
import { TicketViewComponent } from './Ticket-Module/ticket-view/ticket-view.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectivesModule } from 'src/app/shared/directives/directives.module';
import { PipeModule } from 'src/app/shared/pipe/pipe.module';
import { MatButtonModule } from '@angular/material/button';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatSidenavModule } from '@angular/material/sidenav';


@NgModule({
  declarations: [
    ListComponent,
    AddNewComponent,
    TicketListComponent,
    TicketViewComponent,
  ],
  imports: [
    CommonModule,
    SupportTicketRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    DirectivesModule,
    PipeModule,
    MatButtonModule,
    NgxPaginationModule,
    MatSidenavModule
  ]
})
export class SupportTicketModule { }
