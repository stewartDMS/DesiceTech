import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';

@Pipe({ name: 'groupBy' })
export class GroupByPipe implements PipeTransform {
  transform(collection: any[], property: string): any {
    if (!collection) {
      return null;
    }
    const groupedCollection = collection.reduce((previous, current) => {
      if (!previous[current[property]]) {
        previous[current[property]] = [current];
      }
      else {
        previous[current[property]].push(current);
      }
      return previous;
    }, {});
    return Object.keys(groupedCollection).map(key => ({ key, value: groupedCollection[key] }));
  }
}


@Pipe({
  name: "sort"
})
export class ArraySortPipe implements PipeTransform {
  transform(array: any, field: string): any[] {
    if (!Array.isArray(array)) {
      return [];
    }
    array.sort((a: any, b: any) => {
      if (a[field] < b[field]) {
        return -1;
      } else if (a[field] > b[field]) {
        return 1;
      } else {
        return 0;
      }
    });
    return array;
  }
}

@Pipe({
  name: 'nameAbbreviation'
})
export class NameAbbreviationPipe implements PipeTransform {
  transform(fullName: string): string {
    // Split the full name into first and last name
    const nameParts = fullName.split(' ');

    if (nameParts.length >= 2) {
      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];

      // Extract the first character of the first name and last name
      const abbreviation = `${firstName.charAt(0)}${lastName.charAt(0)}`;

      return abbreviation.toUpperCase();
    }
    return fullName;
  }
}

@Pipe({ name: 'niceTime' })
export class NiceTimePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (value) {
      const activationDate = this.getNowUTC();
      const seconds = Math.floor((+new Date(activationDate) - +new Date(value)) / 1000);
      if (seconds < 59) // less than 30 seconds ago will show as 'Just now'
        return 'Just now';
      const intervals: any = {
        'year': 31536000,
        'month': 2630000,
        'week': 604800,
        'day': 86400,
        'hour': 3600,
        'minute': 60,
        'sec': 1
      };
      let counter;
      for (const i in intervals) {
        counter = Math.floor(seconds / intervals[i]);
        if (counter > 0) {
          if (counter === 1) {
            return counter + ' ' + i + ' ' + 'ago'; // singular (1 day )
          } else {
            return counter + ' ' + i + 's ' + 'ago'; // plural (2 days )
          }
        }
      }
    }
    return value;
  }
  private getNowUTC() {
    const now = new Date();
    return now.toJSON();
    //return new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
  }
}

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {
  transform(totalMinutes: any): string {
    if (totalMinutes == null) {
      return '';
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return (hours < 9 ? ('0' + hours) : hours) + 'H:' + (minutes < 9 ? ('0' + minutes) : minutes) + 'M';
  }
}


@Pipe({
  name: 'niceDateFormat'
})
export class NiceDateFormatPipe implements PipeTransform {
  transform(value: any): any {
    const valueData = new Date(value)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (valueData.getFullYear() == today.getFullYear() && valueData.getMonth() == today.getMonth() && valueData.getDate() == today.getDate()) {
      const time = new Date(value);
      const now = new Date();
      const seconds = Math.floor((now.getTime() - time.getTime()) / 1000);

      if (seconds < 60) {
        return 'just now';
      } else if (seconds < 3600) {
        return Math.floor(seconds / 60) + ' minutes ago';
      } else if (seconds < 86400) {
        return Math.floor(seconds / 3600) + ' hours ago';
      }
    }
    else if (valueData.getFullYear() == yesterday.getFullYear() && valueData.getMonth() == yesterday.getMonth() && valueData.getDate() == yesterday.getDate())
      return "Yesterday";
    else {
      return (new DatePipe("en-US")).transform(valueData, 'dd/MM/yyyy hh:mm:ss a');
    }
  }

}

@Pipe({
  name: 'commentFormat'
})
export class commentPipeFormat implements PipeTransform {
  transform(value: any): any {
    const valueData = new Date(value)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (valueData.getFullYear() == today.getFullYear() && valueData.getMonth() == today.getMonth() && valueData.getDate() == today.getDate()) {
      const time = new Date(value);
      const now = new Date();
      const seconds = Math.floor((now.getTime() - time.getTime()) / 1000);

      if (seconds < 60) {
        return 'just now';
      } else if (seconds < 3600) {
        return Math.floor(seconds / 60) + ' minutes ago';
      } else if (seconds < 86400) {
        return Math.floor(seconds / 3600) + ' hours ago';
      }
    }
    else if (valueData.getFullYear() == yesterday.getFullYear() && valueData.getMonth() == yesterday.getMonth() && valueData.getDate() == yesterday.getDate())
      return "Yesterday";
    else {
      return (new DatePipe("en-US")).transform(valueData, 'MMMM d, y, h:mm a');
    }
  }

}

