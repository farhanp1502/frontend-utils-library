import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap, of, tap, map, from, BehaviorSubject, Subject } from 'rxjs';
import { DbService } from './service/db/db.service';
import { ApiBaseService } from './service/api-base/api-base.service';

@Injectable({
  providedIn: 'root'
})
export class FormsService {
  private formsConfigSubject = new BehaviorSubject<any>(null); // Initialize with null
  formsConfig$ = this.formsConfigSubject.asObservable(); // Expose Observable

  setFormsConfig(config: any): void {
    console.log("Setting Forms Config:", config);
    this.formsConfigSubject.next(config); // Update the stored data
  }

  constructor(private apiBaseService: ApiBaseService, private indexDb: DbService) {}

  getForm(formConfig: any): Observable<any> {
    return from(this.indexDb.getTransaction(formConfig.payload.subType)).pipe(
      switchMap((dbResponse: any) => {
        if (dbResponse) {
          console.log("Fetching data from IndexedDB:", dbResponse);
          return of(dbResponse); // Return from IndexedDB
        } else {
          console.log("Fetching data from API...");
          return this.apiBaseService.post(formConfig.url, formConfig.payload).pipe(
            switchMap((apiResponse: any) => {
              if (apiResponse) {
                console.log("Storing API response to IndexedDB...");
                const dataToStore = {
                  key: formConfig.payload.subType,
                  data: apiResponse
                };
                return from(this.indexDb.addData(dataToStore)).pipe(
                  map(() => dataToStore) // Return API response after storing it
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