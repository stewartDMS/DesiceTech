import { NgModule } from '@angular/core';
import { ArraySortPipe, DurationPipe, GroupByPipe, NameAbbreviationPipe, NiceDateFormatPipe, NiceTimePipe, commentPipeFormat } from './common.pipe';

@NgModule({
  imports: [],
  declarations: [NiceTimePipe, GroupByPipe, ArraySortPipe, NiceDateFormatPipe, NameAbbreviationPipe, DurationPipe, commentPipeFormat],
  exports: [NiceTimePipe, GroupByPipe, ArraySortPipe, NiceDateFormatPipe, NameAbbreviationPipe, DurationPipe, commentPipeFormat]
})
export class PipeModule { }
