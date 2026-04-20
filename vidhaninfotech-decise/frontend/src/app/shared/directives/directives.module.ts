import { NgModule } from '@angular/core';
//import { ScrollBarDirective, HighlightDirective } from './common.directive';
import { ConfirmDirective, NumbersOnlyDirective, ValidateRatingDirective } from './common.directive';

@NgModule({
  imports: [],
  declarations: [NumbersOnlyDirective, ConfirmDirective, ValidateRatingDirective],
  exports: [NumbersOnlyDirective, ConfirmDirective, ValidateRatingDirective]
})
export class DirectivesModule { }