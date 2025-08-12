import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

canActivate(route: ActivatedRouteSnapshot): boolean {
  // 1️⃣ First, check if logged in
  if (!this.authService.isLoggedIn()) {
    this.router.navigate(['/login']);
    return false;
  }

  // 2️⃣ Get user and role from route data
  const user:any = this.authService.getUser();
  const requiredRole = route.data['role'];

  // 3️⃣ Check role (if required)
  if (requiredRole && user?.role !== requiredRole) {
    this.router.navigate(['/unauthorized']);
    return false;
  }

  return true;
}

}
