import { Injectable } from '@angular/core';
import  { environment } from '../../../environments/environment.development';
import { catchError, map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Address, AddressesListResponse, updateUserProfileBody, User, userProfile } from '../interfaces/user.interface';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = environment.apiUrl;
  constructor(private _http:HttpClient){}

  getUserProfile():Observable<userProfile>{
    return this._http.get<userProfile>(`${this.baseUrl}/user/profile`);
  }

  updateUserProfile(body:updateUserProfileBody):Observable<userProfile>{
    return this._http.put<userProfile>(`${this.baseUrl}/user/profile`,body);
  }

  getAddresses():Observable<AddressesListResponse>{
    return this._http.get<AddressesListResponse>(`${this.baseUrl}/user/addresses`);
  }

  addAddresses(addresses: Address[]): Observable<AddressesListResponse> {
  return this._http.post<AddressesListResponse>(`${this.baseUrl}/user/addresses`, { addresses });
  }

  updateAddress(addressId:string,address:Address):Observable<{data:Address , message:string}>{
    return this._http.put<{data:Address , message:string}>(`${this.baseUrl}/user/addresses/${addressId}`,address);
  }

  removeAddress(addressId:string):Observable<{message:string}>{
    return this._http.delete<{message:string}>(`${this.baseUrl}/user/addresses/${addressId}`);
  }

  getUserRole(): Observable<string> {
  return this.getUserProfile().pipe(
    map(res => res.data.role),
    catchError(() => of('user'))
  );
  }

  getUserId():Observable<string>{
    return this.getUserProfile().pipe(
      map(res=>res.data._id)
    )
  }

}
