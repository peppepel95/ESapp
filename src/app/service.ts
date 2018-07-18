import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable()
export class Service {
    public Values: string[] = [];
    
    getObsValues(): any {
      return Observable.interval(200).flatMap(() => {
        return this.Values;
      });
    }
}