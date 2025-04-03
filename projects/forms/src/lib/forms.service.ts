import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap, of, tap, map, from, BehaviorSubject, Subject } from 'rxjs';
import { DbService } from './service/db/db.service';
import { ApiBaseService } from './service/api-base/api-base.service';

@Injectable({
  providedIn: 'root'
})
export class FormsService {
  private formsConfigSubject = new BehaviorSubject<any>(null); 
  formsConfig$ = this.formsConfigSubject.asObservable();

  setFormsConfig(config: any): void {
    this.formsConfigSubject.next(config);
  }

  constructor(private apiBaseService: ApiBaseService, private indexDb: DbService) {}

  getForm(formConfig: any): Observable<any> {
    return from(this.indexDb.getTransaction(`${formConfig.payload.type}_${formConfig.payload.subType}`)).pipe(
      switchMap((dbResponse: any) => {
        if (dbResponse) {
          return of(dbResponse);
        } else {
          return this.apiBaseService.post(formConfig.url, formConfig.payload).pipe(
            switchMap((apiResponse: any) => {
              if (apiResponse) {
                const dataToStore = {
                  key: `${formConfig.payload.type}_${formConfig.payload.subType}`,
                  data: apiResponse
                };
                return from(this.indexDb.addData(dataToStore)).pipe(
                  map(() => dataToStore)
                );
              } else {
                return of(null);
              }
            })
          );
        }
      })
    );
  }
}