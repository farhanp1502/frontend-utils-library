import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { FormsService } from '../../forms.service';

@Injectable({
  providedIn: 'root'
})
export class ApiBaseService {
  protected baseURL:any;
  constructor(public http: HttpClient,private formsService: FormsService,private injector: Injector) {
    setTimeout(() => {
      this.formsService = this.injector.get(FormsService);
      this.formsService.formsConfig$.subscribe(config => {
        if (config) {
          this.baseURL = config.BASEURL;
        }
      });
    });
  }

  get<T>(url: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(this.baseURL+url, { params });
  }

  post<T>(url: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.post<T>(this.baseURL+url, body, { headers });
  }

  put<T>(url: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.put<T>(this.baseURL+url, body, { headers });
  }

  patch<T>(url: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.patch<T>(this.baseURL + url, body, { headers });
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(this.baseURL+url);
  }
}
